import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

type TextureConfig = {
	name: string;
	paths: Record<string, string>;
	config?: Record<string, Record<string, any>>;
};

export const Route = createFileRoute("/textures")({
	component: RouteComponent,
});

function texturePath(path: string) {
	return `${import.meta.env.BASE_URL}textures/${path}`;
}

const textures: TextureConfig[] = [
	{
		name: "Door",
		paths: {
			map: "door/color.jpg",
			alphaMap: "door/alpha.jpg",
			aoMap: "door/ambientOcclusion.jpg",
			displacementMap: "door/height.jpg",
			metalnessMap: "door/metalness.jpg",
			normalMap: "door/normal.jpg",
			roughnessMap: "door/roughness.jpg",
		},

		config: {
			map: {
				colorSpace: three.SRGBColorSpace,
			},
		},
	},
	{
		name: "Checkerboard 1024x1024",
		paths: { map: "checkerboard-1024x1024.png" },
		config: {
			map: {
				colorSpace: three.SRGBColorSpace,
				magFilter: three.NearestFilter,
				minFilter: three.NearestFilter,
			},
		},
	},
	{
		name: "Checkerboard 8x8",
		paths: { map: "checkerboard-8x8.png" },
		config: {
			map: {
				magFilter: three.NearestFilter,
			},
		},
	},
	{
		name: "Minecraft",
		paths: { map: "minecraft.png" },
		config: {
			map: {
				colorSpace: three.SRGBColorSpace,
				magFilter: three.NearestFilter,
				minFilter: three.NearestFilter,
				generateMipmaps: false,
			},
		},
	},
];

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

	function setupTextureLoader() {
		const loaderManager = new three.LoadingManager();
		const textureLoader = new three.TextureLoader(loaderManager);

		return { loaderManager, textureLoader };
	}

	function createCube(materialArgs: three.MeshBasicMaterialParameters) {
		const geometry = new three.BoxGeometry(1, 1, 1);
		const material = new three.MeshBasicMaterial(materialArgs);
		const cube = new three.Mesh(geometry, material);

		return {
			cube,
			material,
			geometry,
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

		const cleanup = setup(renderer, camera);
		const { textureLoader } = setupTextureLoader();

		const cubes: three.Mesh[] = [];
		const materials: three.MeshBasicMaterial[] = [];

		textures.forEach((texture, index) => {
			const config = Object.entries(texture.paths).reduce(
				(obj, [key, path]) => {
					const meshTexture = textureLoader.load(texturePath(path));

					const config = texture.config?.[key] || {};
					Object.assign(meshTexture, config);

					obj[key] = meshTexture;
					return obj;
				},
				{} as Record<string, three.Texture>,
			);

			const { cube, material } = createCube(config);
			cube.position.x = index * 2;

			cubes.push(cube);
			materials.push(material);

			scene.add(cube);
		});

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
