import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import * as three from "three";

export const Route = createFileRoute("/move-camera")({
	component: RouteComponent,
});

function RouteComponent() {
	const cursorRef = useRef({ x: 0, y: 0 });

	function createCube(color: string) {
		const geometry = new three.BoxGeometry(1, 1, 1);
		const material = new three.MeshBasicMaterial({ color: color });
		const cube = new three.Mesh(geometry, material);
		return cube;
	}

	function onMouseMove(event: MouseEvent) {
		cursorRef.current.x = event.clientX / window.innerWidth - 0.5;
		cursorRef.current.y = -(event.clientY / window.innerHeight - 0.5);
	}

	function init() {
		const renderer = new three.WebGLRenderer();
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

		renderer.setAnimationLoop(() => {
			camera.position.x = Math.sin(cursorRef.current.x * Math.PI * 2) * 2;
			camera.position.z = Math.cos(cursorRef.current.x * Math.PI * 2) * 2;
			camera.position.y = cursorRef.current.y * 3;

			camera.lookAt(group.position);

			renderer.render(scene, camera);
		});

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
		};
	}

	useEffect(() => {
		const cleanUp = init();

		window.addEventListener("mousemove", onMouseMove);

		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			cleanUp();
		};
	}, []);

	return <div id="scene"></div>;
}
