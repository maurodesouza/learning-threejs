import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const Route = createFileRoute("/door")({
	component: RouteComponent,
});

function texturePath(path: string) {
	return `${import.meta.env.BASE_URL}textures/${path}`;
}

function createDoorMaterial() {
	const textureLoader = new three.TextureLoader();

	const colorTexture = textureLoader.load(texturePath("door/color.jpg"));
	colorTexture.colorSpace = three.SRGBColorSpace;

	const alphaTexture = textureLoader.load(texturePath("door/alpha.jpg"));
	const ambientOcclusionTexture = textureLoader.load(
		texturePath("door/ambientOcclusion.jpg"),
	);
	const heightTexture = textureLoader.load(texturePath("door/height.jpg"));
	const metalnessTexture = textureLoader.load(
		texturePath("door/metalness.jpg"),
	);
	const normalTexture = textureLoader.load(texturePath("door/normal.jpg"));
	const roughnessTexture = textureLoader.load(
		texturePath("door/roughness.jpg"),
	);

	const doorMaterial = new three.MeshStandardMaterial();

	doorMaterial.metalness = 1;
	doorMaterial.roughness = 1;

	doorMaterial.map = colorTexture;

	doorMaterial.aoMap = ambientOcclusionTexture;
	doorMaterial.aoMapIntensity = 3;

	doorMaterial.displacementMap = heightTexture;
	doorMaterial.displacementScale = 0.1;

	doorMaterial.metalnessMap = metalnessTexture;
	doorMaterial.roughnessMap = roughnessTexture;

	doorMaterial.normalMap = normalTexture;
	doorMaterial.normalScale.set(3, 3);

	doorMaterial.alphaMap = alphaTexture;
	doorMaterial.transparent = true;

	doorMaterial.side = three.DoubleSide;

	return doorMaterial;
}

function RouteComponent() {
	function setup(
		renderer: three.WebGLRenderer,
		camera: three.PerspectiveCamera,
	) {
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		function onResize() {
			setup(renderer, camera);
		}

		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
		};
	}

	function init() {
		const canvas = document.querySelector("canvas");

		if (!canvas) {
			console.error("[door]: it wasn't possible to find the canvas element");
			return;
		}

		const renderer = new three.WebGLRenderer({ canvas });
		const camera = new three.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			100,
		);
		camera.position.z = 2;

		const scene = new three.Scene();
		scene.background = new three.Color(0x222222);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const ambientLight = new three.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);

		const directionalLight = new three.DirectionalLight(0xffffff, 1.5);
		directionalLight.position.set(0, 2, 2);
		scene.add(directionalLight);

		const cleanup = setup(renderer, camera);

		const doorMaterial = createDoorMaterial();
		const door = new three.Mesh(
			new three.PlaneGeometry(1, 1, 100, 100),
			doorMaterial,
		);
		scene.add(door);

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			cleanup();

			scene.traverse((object) => {
				if (object instanceof three.Mesh) {
					object.geometry.dispose();

					if (Array.isArray(object.material)) {
						for (const material of object.material) material.dispose();
					} else object.material.dispose();
				}
			});

			scene.clear();
			renderer.dispose();
			renderer.setAnimationLoop(null);
		};
	}

	useEffect(() => init(), []);

	return <canvas />;
}
