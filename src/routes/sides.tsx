import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const Route = createFileRoute("/sides")({
	component: RouteComponent,
});

const sideExamples = [
	{ label: "FrontSide", side: three.FrontSide, color: "#22c55e" },
	{ label: "BackSide", side: three.BackSide, color: "#ef4444" },
	{ label: "DoubleSide", side: three.DoubleSide, color: "#3b82f6" },
];

function createLabel(text: string) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 320;
	canvas.height = 64;

	if (!context) return new three.Sprite();

	context.fillStyle = "#ffffff";
	context.font = "bold 32px sans-serif";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(text, canvas.width / 2, canvas.height / 2);

	const texture = new three.CanvasTexture(canvas);
	const material = new three.SpriteMaterial({
		map: texture,
		transparent: true,
	});
	const label = new three.Sprite(material);
	label.scale.set(2.5, 0.5, 1);
	return label;
}

function RouteComponent() {
	function init() {
		const container = document.getElementById("scene");
		if (!container) return;

		const renderer = new three.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		const scene = new three.Scene();
		scene.background = new three.Color(0x111827);

		const cubes: three.Mesh[] = [];
		const labels: three.Sprite[] = [];
		const geometry = new three.BoxGeometry(1.8, 1.8, 1.8);

		for (const [index, example] of sideExamples.entries()) {
			const material = new three.MeshStandardMaterial({
				color: example.color,
				side: example.side,
				roughness: 0.45,
				metalness: 0.1,
			});
			const cube = new three.Mesh(geometry, material);
			cube.position.x = (index - 1) * 3.8;
			cube.rotation.set(0.35, 0.55, 0);
			cubes.push(cube);
			scene.add(cube);

			const label = createLabel(example.label);
			label.position.set(cube.position.x, 1.7, 0);
			labels.push(label);
			scene.add(label);
		}

		const ambientLight = new three.HemisphereLight(0xffffff, 0x1e293b, 2);
		const directionalLight = new three.DirectionalLight(0xffffff, 3);
		directionalLight.position.set(4, 6, 8);
		scene.add(ambientLight, directionalLight);

		const camera = new three.PerspectiveCamera(
			55,
			window.innerWidth / window.innerHeight,
			0.1,
			100,
		);
		camera.position.set(0, 0, 10);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.minDistance = 5;
		controls.maxDistance = 20;

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener("resize", handleResize);

		renderer.setAnimationLoop(() => {
			for (const cube of cubes) cube.rotation.y += 0.01;
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			window.removeEventListener("resize", handleResize);
			renderer.setAnimationLoop(null);
			controls.dispose();
			geometry.dispose();
			for (const cube of cubes) {
				for (const material of Array.isArray(cube.material)
					? cube.material
					: [cube.material]) {
					material.dispose();
				}
			}
			for (const label of labels) {
				label.material.map?.dispose();
				label.material.dispose();
			}
			renderer.dispose();
			renderer.domElement.remove();
		};
	}

	useEffect(() => init(), []);

	return <div id="scene"></div>;
}
