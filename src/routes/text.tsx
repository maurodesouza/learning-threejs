import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as three from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { assets } from "#/utils/assets";
import { createCleanup, disposeRenderer, disposeScene } from "#/utils/cleanup";
import { setup } from "#/utils/setup";

const CONFIG = {
	shapes: {
		total: 200,
		minScale: 0.5,
		maxScale: 1,
	},
	textures: {
		total: 8,
	},
	movement: {
		minSpeed: 0.005,
		maxSpeed: 0.02,
		minRotationSpeed: -0.005,
		maxRotationSpeed: 0.005,
	},
	spawn: {
		minDistanceFromText: 3,
		maxDistanceFromText: 20,
	},
	boundary: 20,
} as const;

type GenerateRandomShapesOptions = {
	materials: three.MeshMatcapMaterial[];
	scene: three.Scene;
};

export const Route = createFileRoute("/text")({
	component: RouteComponent,
});

function RouteComponent() {
	function generateRandomMovement(mesh: three.Mesh) {
		const speedRange = CONFIG.movement.maxSpeed - CONFIG.movement.minSpeed;
		const rotationSpeedRange =
			CONFIG.movement.maxRotationSpeed - CONFIG.movement.minRotationSpeed;

		const speed = CONFIG.movement.minSpeed + Math.random() * speedRange;

		mesh.userData.velocity = new three.Vector3(
			(Math.random() - 0.5) * speed,
			(Math.random() - 0.5) * speed,
			(Math.random() - 0.5) * speed,
		);

		mesh.userData.rotationSpeed = new three.Vector3(
			CONFIG.movement.minRotationSpeed + Math.random() * rotationSpeedRange,
			CONFIG.movement.minRotationSpeed + Math.random() * rotationSpeedRange,
			CONFIG.movement.minRotationSpeed + Math.random() * rotationSpeedRange,
		);
	}

	function generateRandomNumber(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function generateRandomPosition(minRadius: number, maxRadius: number) {
		const radius = minRadius + Math.random() * (maxRadius - minRadius);
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(2 * Math.random() - 1);

		return new three.Vector3(
			radius * Math.sin(phi) * Math.cos(theta),
			radius * Math.sin(phi) * Math.sin(theta),
			radius * Math.cos(phi),
		);
	}

	function generateRandomShapes(
		total: number,
		options: GenerateRandomShapesOptions,
	) {
		const { materials, scene } = options;

		const torusGeometry = new three.TorusGeometry(0.3, 0.15, 16, 100);
		const octahedronGeometry = new three.OctahedronGeometry(0.5, 0);
		const tetrahedronGeometry = new three.TetrahedronGeometry(0.3, 0);

		const shapes = [torusGeometry, octahedronGeometry, tetrahedronGeometry];
		const meshes: three.Mesh[] = [];

		for (let i = 0; i < total; i++) {
			const materialIndex = generateRandomNumber(0, materials.length - 1);
			const geometryIndex = generateRandomNumber(0, shapes.length - 1);

			const mesh = new three.Mesh(
				shapes[geometryIndex],
				materials[materialIndex],
			);

			mesh.position.copy(
				generateRandomPosition(
					CONFIG.spawn.minDistanceFromText,
					CONFIG.spawn.maxDistanceFromText,
				),
			);

			mesh.rotation.set(
				Math.random() * Math.PI,
				Math.random() * Math.PI,
				Math.random() * Math.PI,
			);

			mesh.scale.setScalar(
				Math.random() * (CONFIG.shapes.maxScale - CONFIG.shapes.minScale) +
					CONFIG.shapes.minScale,
			);
			generateRandomMovement(mesh);

			scene.add(mesh);
			meshes.push(mesh);
		}

		return meshes;
	}

	function loadTextures(total: number) {
		const textureLoader = new three.TextureLoader();

		const materials: three.MeshMatcapMaterial[] = [];

		for (let i = 0; i < total; i++) {
			const path = `/textures/matcaps/${i + 1}.png`;
			const texture = textureLoader.load(assets.publicPath(path));
			texture.colorSpace = three.SRGBColorSpace;
			materials.push(new three.MeshMatcapMaterial({ matcap: texture }));
		}

		return materials;
	}

	function init() {
		const renderer = setup.webGLRenderer("canvas");
		const camera = setup.perspectiveCamera();
		const scene = setup.basicScene();
		const controls = setup.orbitControls(camera, renderer.domElement);

		const materials = loadTextures(CONFIG.textures.total);

		const fontLoader = new FontLoader();

		fontLoader.load(
			assets.publicPath("/fonts/helvetiker_regular.typeface.json"),
			(font) => {
				const textGeometry = new TextGeometry("Ahh... Hellow!??", {
					font,
					size: 0.5,
					depth: 0.2,
					curveSegments: 12,
					bevelEnabled: true,
					bevelThickness: 0.03,
					bevelSize: 0.02,
					bevelOffset: 0,
					bevelSegments: 5,
				});

				textGeometry.computeBoundingBox();
				textGeometry.center();

				const materialIndex = generateRandomNumber(0, materials.length - 1);

				const text = new three.Mesh(textGeometry, materials[materialIndex]);
				scene.add(text);
			},
		);

		const meshes = generateRandomShapes(CONFIG.shapes.total, {
			materials,
			scene,
		});

		renderer.setAnimationLoop(() => {
			for (const mesh of meshes) {
				mesh.position.add(mesh.userData.velocity as three.Vector3);
				mesh.rotation.x += mesh.userData.rotationSpeed.x as number;
				mesh.rotation.y += mesh.userData.rotationSpeed.y as number;
				mesh.rotation.z += mesh.userData.rotationSpeed.z as number;

				if (Math.abs(mesh.position.x) > CONFIG.boundary) {
					mesh.userData.velocity.x *= -1;
				}
				if (Math.abs(mesh.position.y) > CONFIG.boundary) {
					mesh.userData.velocity.y *= -1;
				}
				if (Math.abs(mesh.position.z) > CONFIG.boundary) {
					mesh.userData.velocity.z *= -1;
				}
			}

			controls.update();
			renderer.render(scene, camera);
		});

		const cleanupResize = setup.resize(renderer, camera);

		return createCleanup(
			cleanupResize,
			() => controls.dispose(),
			() => disposeScene(scene),
			() => disposeRenderer(renderer),
		);
	}

	useEffect(() => {
		const cleanup = init();
		return cleanup;
	}, []);

	return <canvas />;
}
