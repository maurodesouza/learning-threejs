import { createFileRoute } from "@tanstack/react-router";
import { gsap } from "gsap";
import GUI from "lil-gui";
import { useEffect } from "react";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const Route = createFileRoute("/ui-debugger")({
	component: RouteComponent,
});

function RouteComponent() {
	function init() {
		const renderer = new three.WebGLRenderer();
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.getElementById("scene")?.appendChild(renderer.domElement);

		const scene = new three.Scene();
		scene.background = new three.Color(0x222222);

		const cubeDebugObg = {
			color: "#ff0000",
			rotate,
			subdivisions: 1,
		};

		const geometry = new three.BoxGeometry(
			1,
			1,
			1,
			cubeDebugObg.subdivisions,
			cubeDebugObg.subdivisions,
			cubeDebugObg.subdivisions,
		);

		const material = new three.MeshBasicMaterial({
			color: cubeDebugObg.color,
			wireframe: true,
		});
		const cube = new three.Mesh(geometry, material);

		scene.add(cube);

		const camera = new three.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.z = 5;

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		function rotate() {
			gsap.to(cube.rotation, {
				x: Math.PI * 2,
				y: Math.PI * 2,
				duration: 2,
				yoyo: true,
				ease: "power1.inOut",
			});
		}

		const gui = new GUI({
			title: "Ahhh Hello!??",
		});

		const cubeTweaks = gui.addFolder("My Cube");

		cubeTweaks.add(cube.position, "x").name("axis X").step(0.1).min(-5).max(5);
		cubeTweaks.add(cube.position, "y").name("axis Y").step(0.1).min(-5).max(5);
		cubeTweaks.add(cube.position, "z").name("axis Z").step(0.1).min(-5).max(5);

		cubeTweaks.add(material, "wireframe");
		cubeTweaks.add(cube, "visible");

		cubeTweaks.addColor(cubeDebugObg, "color").onChange((value: string) => {
			material.color.set(value);
		});

		cubeTweaks
			.add(cube.scale, "x")
			.name("scale X")
			.options({ min: 0.1, default: 1, max: 5 });
		cubeTweaks
			.add(cube.scale, "y")
			.name("scale Y")
			.options({ min: 0.1, default: 1, max: 5 });
		cubeTweaks
			.add(cube.scale, "z")
			.name("scale Z")
			.options({ min: 0.1, default: 1, max: 5 });

		cubeTweaks
			.add(cubeDebugObg, "subdivisions")
			.min(1)
			.max(20)
			.step(1)
			.onFinishChange((value: number) => {
				const newGeometry = new three.BoxGeometry(1, 1, 1, value, value, value);
				cube.geometry.dispose();
				cube.geometry = newGeometry;
			});

		cubeTweaks.add(cubeDebugObg, "rotate");

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

		function toggleGUI(event: KeyboardEvent) {
			if (event.key === "h") gui.show(gui._hidden);
		}

		window.addEventListener("resize", onResize);
		window.addEventListener("keydown", toggleGUI);

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

			gui.destroy();

			window.removeEventListener("resize", onResize);
			window.removeEventListener("keydown", toggleGUI);
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
