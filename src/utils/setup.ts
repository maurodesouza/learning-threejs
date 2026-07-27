import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const setup = {
	webGLRenderer(
		canvasOrSelector?: HTMLCanvasElement | string,
		options?: three.WebGLRendererParameters,
	) {
		const canvas =
			typeof canvasOrSelector === "string"
				? (document.querySelector<HTMLCanvasElement>(canvasOrSelector) ??
					undefined)
				: canvasOrSelector;

		const renderer = new three.WebGLRenderer({ canvas, ...options });

		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);

		return renderer;
	},

	perspectiveCamera(
		fov = 75,
		near = 0.1,
		far = 100,
		position: three.Vector3Tuple = [0, 0, 5],
	) {
		const camera = new three.PerspectiveCamera(
			fov,
			window.innerWidth / window.innerHeight,
			near,
			far,
		);

		camera.position.set(...position);

		return camera;
	},

	basicScene(backgroundColor: three.ColorRepresentation = 0x222222) {
		const scene = new three.Scene();

		scene.background = new three.Color(backgroundColor);

		return scene;
	},

	orbitControls(camera: three.Camera, domElement: HTMLElement) {
		const controls = new OrbitControls(camera, domElement);

		controls.enableDamping = true;

		return controls;
	},

	basicCube(color: three.ColorRepresentation = 0xff0000) {
		const geometry = new three.BoxGeometry(1, 1, 1);
		const material = new three.MeshBasicMaterial({ color });
		const cube = new three.Mesh(geometry, material);

		return { cube, geometry, material };
	},

	resize(renderer: three.WebGLRenderer, camera: three.PerspectiveCamera) {
		function onResize() {
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.setSize(window.innerWidth, window.innerHeight);

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}

		onResize();
		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
		};
	},
};
