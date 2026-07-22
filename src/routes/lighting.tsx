import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as three from "three";

export const Route = createFileRoute("/lighting")({
	component: RouteComponent,
});

function RouteComponent() {
	function animateCube(cube: three.Mesh) {
		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;
	}

	function createCube(color: string) {
		const geometry = new three.BoxGeometry(1, 1, 1);
		const material = new three.MeshLambertMaterial({ color: color });
		const cube = new three.Mesh(geometry, material);
		return cube;
	}

	function init() {
		const renderer = new three.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.getElementById("scene")?.appendChild(renderer.domElement);

		const cube1 = createCube("#ff0000");
		const cube2 = createCube("#00ff00");
		const cube3 = createCube("#0000ff");

		cube1.position.x = -2;
		cube2.position.x = 0;
		cube3.position.x = 2;

		const light = new three.HemisphereLight(0xffffff, 0x404040, 0.5);

		const scene = new three.Scene();
		scene.add(light);

		scene.add(cube1);
		scene.add(cube2);
		scene.add(cube3);
		scene.background = new three.Color(0x222222);

		const camera = new three.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
		);
		camera.position.z = 5;

		renderer.setAnimationLoop(() => {
			animateCube(cube1);
			animateCube(cube2);
			animateCube(cube3);

			renderer.render(scene, camera);
		});
	}

	useEffect(() => {
		init();
	}, []);

	return <div id="scene"></div>;
}
