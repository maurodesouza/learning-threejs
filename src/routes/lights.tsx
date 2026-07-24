import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

export const Route = createFileRoute("/lights")({
	component: RouteComponent,
});

type LightConfig = {
	name: string;
	createLight: () => three.Light;
};

const lightConfigs: LightConfig[] = [
	// Lights that do not cast shadows
	{
		name: "AmbientLight",
		createLight: () => new three.AmbientLight(0xffffff, 1.5),
	},
	{
		name: "HemisphereLight",
		createLight: () => new three.HemisphereLight(0xffffff, 0x444444, 1.5),
	},
	{
		name: "RectAreaLight",
		createLight: () => {
			const light = new three.RectAreaLight(0xffffff, 4, 2, 2);
			light.position.set(0, 2.5, 0);
			light.lookAt(0, 0, 0);
			return light;
		},
	},
	// Lights that cast shadows
	{
		name: "DirectionalLight",
		createLight: () => {
			const light = new three.DirectionalLight(0xffffff, 2);
			light.position.set(0, 5, 0);
			light.castShadow = true;
			light.shadow.mapSize.width = 1024;
			light.shadow.mapSize.height = 1024;
			return light;
		},
	},
	{
		name: "PointLight",
		createLight: () => {
			const light = new three.PointLight(0xffffff, 8, 10);
			light.position.set(0, 2.5, 0);
			light.castShadow = true;
			light.shadow.mapSize.width = 1024;
			light.shadow.mapSize.height = 1024;
			return light;
		},
	},
	{
		name: "SpotLight",
		createLight: () => {
			const light = new three.SpotLight(0xffffff, 10);
			light.position.set(0, 3.5, 0);
			light.angle = Math.PI / 6;
			light.penumbra = 0.3;
			light.decay = 1.5;
			light.distance = 12;
			light.castShadow = true;
			light.shadow.mapSize.width = 1024;
			light.shadow.mapSize.height = 1024;
			return light;
		},
	},
];

function createLabel(text: string) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 320;
	canvas.height = 64;

	if (!context) return new three.Sprite();

	context.fillStyle = "#ffffff";
	context.font = "bold 28px sans-serif";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(text, canvas.width / 2, canvas.height / 2);

	const texture = new three.CanvasTexture(canvas);
	const material = new three.SpriteMaterial({
		map: texture,
		transparent: true,
	});
	const label = new three.Sprite(material);
	label.scale.set(3.2, 0.64, 1);
	return label;
}

function RouteComponent() {
	function init() {
		const container = document.getElementById("scene");
		if (!container) return;

		RectAreaLightUniformsLib.init();

		const renderer = new three.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = three.PCFSoftShadowMap;
		container.appendChild(renderer.domElement);

		const scene = new three.Scene();
		scene.background = new three.Color(0x111827);

		const columns = 3;
		const spacingX = 18;
		const spacingZ = 18;
		const offsetX = ((columns - 1) * spacingX) / 2;
		const offsetZ = spacingZ / 2;

		const cubes: three.Mesh[] = [];

		for (const [index, config] of lightConfigs.entries()) {
			const group = new three.Group();
			group.position.set(
				(index % columns) * spacingX - offsetX,
				0,
				offsetZ - Math.floor(index / columns) * spacingZ,
			);

			const planeGeometry = new three.PlaneGeometry(9, 9);
			const planeMaterial = new three.MeshStandardMaterial({
				color: 0x334155,
				roughness: 0.8,
				metalness: 0.1,
				side: three.DoubleSide,
			});
			const plane = new three.Mesh(planeGeometry, planeMaterial);
			plane.rotation.x = -Math.PI / 2;
			plane.position.y = -1;
			plane.receiveShadow = true;
			group.add(plane);

			const cubeGeometry = new three.BoxGeometry(1.2, 1.2, 1.2);
			const cubeMaterial = new three.MeshStandardMaterial({
				color: 0xe2e8f0,
				roughness: 0.4,
				metalness: 0.1,
			});
			const cube = new three.Mesh(cubeGeometry, cubeMaterial);
			cube.position.y = 0.6;
			cube.castShadow = true;
			cube.receiveShadow = true;
			group.add(cube);
			cubes.push(cube);

			const light = config.createLight();
			group.add(light);

			if (
				light instanceof three.SpotLight ||
				light instanceof three.DirectionalLight
			) {
				const target = new three.Object3D();
				target.position.set(0, 0.6, 0);
				group.add(target);
				light.target = target;
			}

			const label = createLabel(config.name);
			label.position.y = 2.6;
			group.add(label);

			scene.add(group);
		}

		const camera = new three.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.set(0, 40, 55);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);
		controls.enableDamping = true;
		controls.maxDistance = 200;
		controls.minDistance = 10;

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener("resize", handleResize);

		renderer.setAnimationLoop(() => {
			for (const cube of cubes) {
				cube.rotation.x += 0.008;
				cube.rotation.y += 0.01;
			}
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			window.removeEventListener("resize", handleResize);
			renderer.setAnimationLoop(null);
			controls.dispose();
			for (const cube of cubes) {
				cube.geometry.dispose();
				(cube.material as three.Material).dispose();
			}
			renderer.dispose();
			renderer.domElement.remove();
		};
	}

	useEffect(() => init(), []);

	return <div id="scene"></div>;
}
