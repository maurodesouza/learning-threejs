import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const Route = createFileRoute("/screen-resize")({
	component: RouteComponent,
});

function RouteComponent() {
	function createCube(color: string) {
		const geometry = new three.BoxGeometry(1, 1, 1);
		const material = new three.MeshBasicMaterial({ color: color });
		const cube = new three.Mesh(geometry, material);
		return cube;
	}

	function init() {
		const renderer = new three.WebGLRenderer();
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.getElementById("scene")?.appendChild(renderer.domElement);

		const cube1 = createCube("#ff0000");
		const cube2 = createCube("#00ff00");
		const cube3 = createCube("#0000ff");

		const group = new three.Group();
		group.add(cube1);
		group.add(cube2);
		group.add(cube3);

		cube1.position.x = -2;
		cube2.position.x = 0;
		cube3.position.x = 2;

		const scene = new three.Scene();
		scene.add(group);
		scene.background = new three.Color(0x222222);

		const camera = new three.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.z = 5;

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		renderer.setAnimationLoop(() => {
			controls.update();

			renderer.render(scene, camera);
		});

		function onResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		}

		window.addEventListener("resize", onResize);

		return () => {
			scene.traverse((object) => {
				if (object instanceof three.Mesh) {
					object.geometry.dispose();

					if (Array.isArray(object.material)) {
						for (const material of object.material) material.dispose();
					} else object.material.dispose();
				}
			});

			scene.clear();
			renderer.setAnimationLoop(null);
			renderer.dispose();
			renderer.domElement.remove();
			renderer.forceContextLoss();

			window.removeEventListener("resize", onResize);
		};
	}

	useEffect(() => {
		const cleanUp = init();

		return () => {
			cleanUp();
		};
	}, []);

	return <div id="scene"></div>;
}
