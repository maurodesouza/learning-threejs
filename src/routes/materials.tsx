import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const Route = createFileRoute("/materials")({
	component: RouteComponent,
});

type ColorOption = {
	name: string;
	hex: string;
};

const colorOptions: ColorOption[] = [
	{ name: "Red", hex: "#ef4444" },
	{ name: "Green", hex: "#22c55e" },
	{ name: "Blue", hex: "#3b82f6" },
	{ name: "White", hex: "#e2e8f0" },
];

type MaterialConfig = {
	name: string;
	cost: string;
	createMaterial: (color: number) => three.Material;
};

function createMatcapTexture() {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 128;
	canvas.height = 128;

	if (!context) return null;

	const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 64);
	gradient.addColorStop(0, "#ffffff");
	gradient.addColorStop(0.35, "#a0a0a0");
	gradient.addColorStop(1, "#333333");

	context.fillStyle = gradient;
	context.fillRect(0, 0, 128, 128);

	return new three.CanvasTexture(canvas);
}

function createToonGradient() {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 4;
	canvas.height = 1;

	if (!context) return null;

	const gradient = context.createLinearGradient(0, 0, 4, 0);
	gradient.addColorStop(0, "#222222");
	gradient.addColorStop(0.5, "#888888");
	gradient.addColorStop(1, "#ffffff");

	context.fillStyle = gradient;
	context.fillRect(0, 0, 4, 1);

	return new three.CanvasTexture(canvas);
}

function hexToNumber(hex: string) {
	return Number.parseInt(hex.replace("#", ""), 16);
}

function createLabel(name: string, cost: string) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 320;
	canvas.height = 80;

	if (!context) return new three.Sprite();

	context.textAlign = "center";
	context.textBaseline = "middle";

	context.fillStyle = "#ffffff";
	context.font = "bold 24px sans-serif";
	context.fillText(name, canvas.width / 2, 28);

	context.fillStyle = "#94a3b8";
	context.font = "18px sans-serif";
	context.fillText(cost, canvas.width / 2, 58);

	const texture = new three.CanvasTexture(canvas);
	const material = new three.SpriteMaterial({
		map: texture,
		transparent: true,
	});
	const label = new three.Sprite(material);
	label.scale.set(4.2, 1.05, 1);
	return label;
}

function hasColorProperty(
	material: three.Material,
): material is three.Material & { color: three.Color } {
	return "color" in material && material.color instanceof three.Color;
}

function RouteComponent() {
	const [ballColor, setBallColor] = useState(colorOptions[3].hex);
	const colorableMaterialsRef = useRef<
		(three.Material & { color: three.Color })[]
	>([]);

	function init() {
		const container = document.getElementById("scene");
		if (!container) return;

		const matcapTexture = createMatcapTexture();
		const toonGradient = createToonGradient();

		colorableMaterialsRef.current = [];

		const initialColor = hexToNumber(ballColor);

		const materialConfigs: MaterialConfig[] = [
			{
				name: "MeshBasicMaterial",
				cost: "Very light",
				createMaterial: (color) => new three.MeshBasicMaterial({ color }),
			},
			{
				name: "MeshNormalMaterial",
				cost: "Very light",
				createMaterial: () => new three.MeshNormalMaterial(),
			},
			{
				name: "MeshLambertMaterial",
				cost: "Light",
				createMaterial: (color) => new three.MeshLambertMaterial({ color }),
			},
			{
				name: "MeshMatcapMaterial",
				cost: "Light",
				createMaterial: (color) =>
					new three.MeshMatcapMaterial({
						color,
						matcap: matcapTexture ?? undefined,
					}),
			},
			{
				name: "MeshPhongMaterial",
				cost: "Medium",
				createMaterial: (color) =>
					new three.MeshPhongMaterial({
						color,
						shininess: 100,
						specular: 0x555555,
					}),
			},
			{
				name: "MeshToonMaterial",
				cost: "Medium",
				createMaterial: (color) =>
					new three.MeshToonMaterial({
						color,
						gradientMap: toonGradient ?? undefined,
					}),
			},
			{
				name: "MeshStandardMaterial",
				cost: "Heavy",
				createMaterial: (color) =>
					new three.MeshStandardMaterial({
						color,
						roughness: 0.4,
						metalness: 0.1,
					}),
			},
			{
				name: "MeshPhysicalMaterial",
				cost: "Very heavy",
				createMaterial: (color) =>
					new three.MeshPhysicalMaterial({
						color,
						roughness: 0.2,
						metalness: 0.1,
						clearcoat: 1.0,
						clearcoatRoughness: 0.1,
					}),
			},
		];

		three.ColorManagement.enabled = true;

		const renderer = new three.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.outputColorSpace = three.SRGBColorSpace;
		renderer.toneMapping = three.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.0;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = three.PCFSoftShadowMap;
		container.appendChild(renderer.domElement);

		const scene = new three.Scene();
		scene.background = new three.Color(0x111827);

		const ambientLight = new three.HemisphereLight(0xffffff, 0x1e293b, 0.6);
		scene.add(ambientLight);

		const columns = 4;
		const spacingX = 28;
		const spacingZ = 28;
		const offsetX = ((columns - 1) * spacingX) / 2;
		const offsetZ = spacingZ / 2;

		const spheres: three.Mesh[] = [];

		for (const [index, config] of materialConfigs.entries()) {
			const group = new three.Group();
			group.position.set(
				(index % columns) * spacingX - offsetX,
				0,
				offsetZ - Math.floor(index / columns) * spacingZ,
			);

			const planeGeometry = new three.PlaneGeometry(18, 18);
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

			const sphereGeometry = new three.SphereGeometry(0.7, 32, 32);
			const sphereMaterial = config.createMaterial(initialColor);
			const sphere = new three.Mesh(sphereGeometry, sphereMaterial);
			sphere.position.y = 0.7;
			sphere.castShadow = true;
			sphere.receiveShadow = true;
			group.add(sphere);
			spheres.push(sphere);

			if (hasColorProperty(sphereMaterial)) {
				colorableMaterialsRef.current.push(sphereMaterial);
			}

			const light = new three.PointLight(0xffffff, 120, 0, 2);
			light.position.set(0, 4, 0);
			light.castShadow = true;
			light.shadow.mapSize.width = 1024;
			light.shadow.mapSize.height = 1024;
			light.shadow.bias = -0.0001;
			group.add(light);

			const label = createLabel(config.name, config.cost);
			label.position.y = 4;
			group.add(label);

			scene.add(group);
		}

		const camera = new three.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.set(0, 45, 65);

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

		const clock = new three.Clock();

		renderer.setAnimationLoop(() => {
			const elapsed = clock.getElapsedTime();

			for (const sphere of spheres) {
				const angle = elapsed * 0.8;
				sphere.position.x = Math.cos(angle) * 3.5;
				sphere.position.z = Math.sin(angle) * 3.5;
				sphere.rotation.x += 0.005;
				sphere.rotation.y += 0.01;
			}

			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			window.removeEventListener("resize", handleResize);
			renderer.setAnimationLoop(null);
			controls.dispose();

			for (const sphere of spheres) {
				sphere.geometry.dispose();
				const material = sphere.material;
				if (Array.isArray(material)) {
					for (const m of material) m.dispose();
				} else {
					material.dispose();
				}
			}

			matcapTexture?.dispose();
			toonGradient?.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		};
	}

	useEffect(() => {
		const cleanup = init();
		return cleanup;
	}, []);

	useEffect(() => {
		const color = hexToNumber(ballColor);
		for (const material of colorableMaterialsRef.current) {
			material.color.set(color);
		}
	}, [ballColor]);

	return (
		<>
			<div id="scene"></div>
			<div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-xl bg-slate-900/80 p-2 shadow-xl backdrop-blur-sm">
				{colorOptions.map((option) => (
					<button
						key={option.hex}
						type="button"
						onClick={() => setBallColor(option.hex)}
						className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
							ballColor === option.hex
								? "bg-white text-slate-900"
								: "bg-slate-800 text-slate-200 hover:bg-slate-700"
						}`}
					>
						<span
							className="h-4 w-4 rounded-full border border-white/20"
							style={{ backgroundColor: option.hex }}
						/>
						{option.name}
					</button>
				))}
			</div>
		</>
	);
}
