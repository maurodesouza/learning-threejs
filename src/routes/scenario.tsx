import { createFileRoute } from "@tanstack/react-router";
import GUI from "lil-gui";
import { useEffect } from "react";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

export const Route = createFileRoute("/scenario")({
	component: RouteComponent,
});

function texturePath(path: string) {
	return `${import.meta.env.BASE_URL}textures/${path}`;
}

function createMaterial() {
	return new three.MeshStandardMaterial({
		side: three.DoubleSide,
		metalness: 1,
		roughness: 0,
	});
}

function createSphere(material: three.MeshStandardMaterial) {
	const geometry = new three.SphereGeometry(0.5, 16, 16);
	const sphere = new three.Mesh(geometry, material);

	return sphere;
}

function createCube(material: three.MeshStandardMaterial) {
	const geometry = new three.BoxGeometry(1, 1, 1);
	const cube = new three.Mesh(geometry, material);

	return cube;
}

function createTorus(material: three.MeshStandardMaterial) {
	const geometry = new three.TorusGeometry(0.3, 0.2, 16, 32);
	const torus = new three.Mesh(geometry, material);

	return torus;
}

function animateMesh(meshes: three.Mesh[], clock: three.Clock) {
	for (const mesh of meshes) {
		mesh.rotation.x = 0.1 * clock.getElapsedTime();
		mesh.rotation.y = 0.3 * clock.getElapsedTime();
	}
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
			console.error(
				"[textures]: it wasn't possible to find the canvas element",
			);
			return;
		}

		const renderer = new three.WebGLRenderer({ canvas });
		const camera = new three.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			100,
		);
		camera.position.z = 5;

		const scene = new three.Scene();
		scene.background = new three.Color(0x222222);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const gui = new GUI();

		const cleanup = setup(renderer, camera);

		const hdrLoader = new HDRLoader();

		hdrLoader.load(texturePath("/environment-map/2k.hdr"), (hdr) => {
			hdr.mapping = three.EquirectangularReflectionMapping;

			scene.background = hdr;
			scene.environment = hdr;
		});

		const material = createMaterial();
		const sphere = createSphere(material);
		const cube = createCube(material);
		const torus = createTorus(material);

		gui.add(material, "metalness").min(0).max(1).step(0.01);
		gui.add(material, "roughness").min(0).max(1).step(0.01);

		sphere.position.x = -2;
		cube.position.x = 0;
		torus.position.x = 2;

		scene.add(sphere, cube, torus);
		const clock = new three.Clock();

		renderer.setAnimationLoop(() => {
			animateMesh([sphere, cube, torus], clock);

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

			gui.destroy();
			scene.clear();
			renderer.dispose();
			renderer.setAnimationLoop(null);
		};
	}

	useEffect(() => init(), []);

	return <canvas />;
}
