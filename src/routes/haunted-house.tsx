import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as three from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { assets } from "#/utils/assets";
import { createCleanup, disposeRenderer, disposeScene } from "#/utils/cleanup";
import { setup } from "#/utils/setup";

export const Route = createFileRoute("/haunted-house")({
	component: RouteComponent,
});

function RouteComponent() {
	function init() {
		const renderer = setup.webGLRenderer("canvas");
		const camera = setup.perspectiveCamera();
		const scene = setup.basicScene();
		const controls = setup.orbitControls(camera, renderer.domElement);

		const textureLoader = new three.TextureLoader();

		const floorAlphaMapTexture = textureLoader.load(
			assets.publicPath("/textures/haunted-house/floor/alpha.webp"),
		);

		const floorColorTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp",
			),
		);

		floorColorTexture.colorSpace = three.SRGBColorSpace;
		floorColorTexture.repeat.set(8, 8);
		floorColorTexture.wrapS = three.RepeatWrapping;
		floorColorTexture.wrapT = three.RepeatWrapping;

		const floorARMTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp",
			),
		);

		floorARMTexture.repeat.set(8, 8);
		floorARMTexture.wrapS = three.RepeatWrapping;
		floorARMTexture.wrapT = three.RepeatWrapping;

		const floorNormalTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp",
			),
		);

		floorNormalTexture.repeat.set(8, 8);
		floorNormalTexture.wrapS = three.RepeatWrapping;
		floorNormalTexture.wrapT = three.RepeatWrapping;

		const floorDisplacementTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp",
			),
		);

		floorDisplacementTexture.repeat.set(8, 8);
		floorDisplacementTexture.wrapS = three.RepeatWrapping;
		floorDisplacementTexture.wrapT = three.RepeatWrapping;

		const floor = new three.Mesh(
			new three.PlaneGeometry(20, 20, 100, 100),
			new three.MeshStandardMaterial({
				alphaMap: floorAlphaMapTexture,
				transparent: true,
				map: floorColorTexture,
				aoMap: floorARMTexture,
				metalnessMap: floorARMTexture,
				roughnessMap: floorARMTexture,
				normalMap: floorNormalTexture,
				displacementMap: floorDisplacementTexture,
				displacementScale: 0.3,
				displacementBias: -0.2,
			}),
		);
		floor.rotation.x = -Math.PI * 0.5;
		scene.add(floor);

		const house = new three.Group();
		scene.add(house);

		const wallColorTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp",
			),
		);
		wallColorTexture.colorSpace = three.SRGBColorSpace;

		const wallARMTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp",
			),
		);

		const wallNormalTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp",
			),
		);

		const walls = new three.Mesh(
			new three.BoxGeometry(4, 2.5, 4),
			new three.MeshStandardMaterial({
				map: wallColorTexture,
				aoMap: wallARMTexture,
				metalnessMap: wallARMTexture,
				roughnessMap: wallARMTexture,
				normalMap: wallNormalTexture,
			}),
		);
		walls.position.y += 1.25;
		house.add(walls);

		const roofColorTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp",
			),
		);
		roofColorTexture.colorSpace = three.SRGBColorSpace;

		roofColorTexture.repeat.set(3, 1);
		roofColorTexture.wrapS = three.RepeatWrapping;

		const roofARMTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp",
			),
		);

		roofARMTexture.repeat.set(3, 1);
		roofARMTexture.wrapS = three.RepeatWrapping;

		const roofNormalTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp",
			),
		);

		roofNormalTexture.repeat.set(3, 1);
		roofNormalTexture.wrapS = three.RepeatWrapping;

		const roof = new three.Mesh(
			new three.ConeGeometry(3.5, 2.5, 4),
			new three.MeshStandardMaterial({
				map: roofColorTexture,
				aoMap: roofARMTexture,
				metalnessMap: roofARMTexture,
				roughnessMap: roofARMTexture,
				normalMap: roofNormalTexture,
			}),
		);
		roof.position.y += 2.5 + 1.25;
		roof.rotation.y = Math.PI / 4;
		house.add(roof);

		const doorColorTexture = textureLoader.load(
			assets.publicPath("/textures/haunted-house/door/color.webp"),
		);
		doorColorTexture.colorSpace = three.SRGBColorSpace;

		const doorAlphaTexture = textureLoader.load(
			assets.publicPath("/textures/haunted-house/door/alpha.webp"),
		);
		const doorAmbientOcclusionTexture = textureLoader.load(
			assets.publicPath("/textures/haunted-house/door/ambientOcclusion.webp"),
		);
		const doorHeightTexture = textureLoader.load(
			assets.publicPath("/textures/haunted-house/door/height.webp"),
		);
		const doorNormalTexture = textureLoader.load(
			assets.publicPath("/textures/haunted-house/door/normal.webp"),
		);
		const doorMetalnessTexture = textureLoader.load(
			assets.publicPath("/textures/haunted-house/door/metalness.webp"),
		);
		const doorRoughnessTexture = textureLoader.load(
			assets.publicPath("/textures/haunted-house/door/roughness.webp"),
		);

		const door = new three.Mesh(
			new three.PlaneGeometry(2.2, 2.2, 100, 100),
			new three.MeshStandardMaterial({
				map: doorColorTexture,
				alphaMap: doorAlphaTexture,
				transparent: true,

				aoMap: doorAmbientOcclusionTexture,
				metalnessMap: doorMetalnessTexture,
				roughnessMap: doorRoughnessTexture,
				normalMap: doorNormalTexture,

				displacementMap: doorHeightTexture,
				displacementScale: 0.15,
				displacementBias: -0.04,
			}),
		);
		door.position.y += 1;
		door.position.z += 2.01;
		house.add(door);

		const bushColorTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp",
			),
		);
		bushColorTexture.colorSpace = three.SRGBColorSpace;

		bushColorTexture.repeat.set(2, 1);
		bushColorTexture.wrapS = three.RepeatWrapping;

		const bushARMTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp",
			),
		);

		bushARMTexture.repeat.set(2, 1);
		bushARMTexture.wrapS = three.RepeatWrapping;

		const bushNormalTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp",
			),
		);
		bushNormalTexture.repeat.set(2, 1);
		bushNormalTexture.wrapS = three.RepeatWrapping;

		const bushGeometry = new three.SphereGeometry(1, 16, 16);
		const bushMaterial = new three.MeshStandardMaterial({
			color: "#ccffcc",
			map: bushColorTexture,
			aoMap: bushARMTexture,
			roughnessMap: bushARMTexture,
			metalnessMap: bushARMTexture,
			normalMap: bushNormalTexture,
		});

		const bush1 = new three.Mesh(bushGeometry, bushMaterial);
		bush1.scale.set(0.5, 0.5, 0.5);
		bush1.position.set(0.8, 0.2, 2.2);
		bush1.rotateX(-0.75);

		const bush2 = new three.Mesh(bushGeometry, bushMaterial);
		bush2.scale.set(0.25, 0.25, 0.25);
		bush2.position.set(1.4, 0.1, 2.1);
		bush2.rotateX(-0.75);

		const bush3 = new three.Mesh(bushGeometry, bushMaterial);
		bush3.scale.set(0.4, 0.4, 0.4);
		bush3.position.set(-0.8, 0.1, 2.2);
		bush3.rotateX(-0.75);

		const bush4 = new three.Mesh(bushGeometry, bushMaterial);
		bush4.scale.set(0.15, 0.15, 0.15);
		bush4.position.set(-1, 0.05, 2.6);
		bush4.rotateX(-0.75);

		house.add(bush1, bush2, bush3, bush4);

		const graveColorTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp",
			),
		);
		graveColorTexture.colorSpace = three.SRGBColorSpace;

		graveColorTexture.repeat.set(0.3, 0.4);
		graveColorTexture.wrapS = three.RepeatWrapping;

		const graveARMTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp",
			),
		);

		graveARMTexture.repeat.set(0.3, 0.4);
		graveARMTexture.wrapS = three.RepeatWrapping;

		const graveNormalTexture = textureLoader.load(
			assets.publicPath(
				"/textures/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp",
			),
		);
		graveNormalTexture.repeat.set(0.3, 0.4);
		graveNormalTexture.wrapS = three.RepeatWrapping;

		const graveGeometry = new three.BoxGeometry(0.6, 0.8, 0.2);
		const graveMaterial = new three.MeshStandardMaterial({
			map: graveColorTexture,
			aoMap: graveARMTexture,
			roughnessMap: graveARMTexture,
			metalnessMap: graveARMTexture,
			normalMap: graveNormalTexture,
		});

		const graves = new three.Group();
		scene.add(graves);

		for (let i = 0; i < 30; i++) {
			const angle = Math.random() * Math.PI * 2;
			const radius = 3 + Math.random() * 4;
			const x = Math.sin(angle) * radius;
			const z = Math.cos(angle) * radius;

			const grave = new three.Mesh(graveGeometry, graveMaterial);
			grave.position.x = x;
			grave.position.y = Math.random() * 0.4;
			grave.position.z = z;

			grave.rotation.x = (Math.random() - 0.5) * 0.4;
			grave.rotation.y = (Math.random() - 0.5) * 0.4;
			grave.rotation.z = (Math.random() - 0.5) * 0.4;

			graves.add(grave);
		}

		const ambientLight = new three.AmbientLight("#86cdff", 0.275);
		scene.add(ambientLight);

		const directionalLight = new three.DirectionalLight("#86cdff", 1);
		scene.add(directionalLight);

		const doorLight = new three.PointLight("#ff7d46", 5);
		doorLight.position.set(0, 2.2, 2.5);
		scene.add(doorLight);

		/**
		 * Ghosts
		 */

		const ghost1 = new three.PointLight("#8800ff", 6);
		const ghost2 = new three.PointLight("#ff0088", 6);
		const ghost3 = new three.PointLight("#ff0000", 6);
		scene.add(ghost1, ghost2, ghost3);

		/**
		 * Shadows
		 */

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = three.PCFShadowMap;

		directionalLight.castShadow = true;
		ghost1.castShadow = true;
		ghost2.castShadow = true;
		ghost3.castShadow = true;

		walls.castShadow = true;
		walls.receiveShadow = true;
		roof.castShadow = true;
		floor.receiveShadow = true;

		for (const grave of graves.children) {
			grave.castShadow = true;
			grave.receiveShadow = true;
		}

		directionalLight.shadow.mapSize.width = 256;
		directionalLight.shadow.mapSize.height = 256;
		directionalLight.shadow.camera.top = 8;
		directionalLight.shadow.camera.right = 8;
		directionalLight.shadow.camera.bottom = -8;
		directionalLight.shadow.camera.left = -8;
		directionalLight.shadow.camera.near = 1;
		directionalLight.shadow.camera.far = 20;

		ghost1.shadow.mapSize.width = 256;
		ghost1.shadow.mapSize.height = 256;
		ghost1.shadow.camera.far = 10;

		ghost2.shadow.mapSize.width = 256;
		ghost2.shadow.mapSize.height = 256;
		ghost2.shadow.camera.far = 10;

		ghost3.shadow.mapSize.width = 256;
		ghost3.shadow.mapSize.height = 256;
		ghost3.shadow.camera.far = 10;

		/**
		 * Sky
		 */
		const sky = new Sky();
		sky.scale.setScalar(450000);

		const sun = new three.Vector3();

		const effects = {
			turbidity: 0,
			rayleigh: 4,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.7,
			elevation: 0,
			azimuth: 180,
			exposure: 0.3,
			cloudCoverage: 0.4,
			cloudDensity: 0.4,
			cloudElevation: 0.5,
			showSunDisc: false,
		};

		sky.material.uniforms.turbidity.value = effects.turbidity;
		sky.material.uniforms.rayleigh.value = effects.rayleigh;
		sky.material.uniforms.mieCoefficient.value = effects.mieCoefficient;
		sky.material.uniforms.mieDirectionalG.value = effects.mieDirectionalG;
		sky.material.uniforms.cloudCoverage.value = effects.cloudCoverage;
		sky.material.uniforms.cloudDensity.value = effects.cloudDensity;
		sky.material.uniforms.cloudElevation.value = effects.cloudElevation;
		sky.material.uniforms.showSunDisc.value = effects.showSunDisc;

		const phi = three.MathUtils.degToRad(90 - effects.elevation);
		const theta = three.MathUtils.degToRad(effects.azimuth);

		sun.setFromSphericalCoords(1, phi, theta);

		sky.material.uniforms.sunPosition.value.copy(sun);

		scene.add(sky);

		renderer.toneMapping = three.ACESFilmicToneMapping;
		renderer.toneMappingExposure = effects.exposure;

		/**
		 * Fog
		 */
		scene.fog = new three.FogExp2("#04343f", 0.03);

		const timer = new three.Timer();

		renderer.setAnimationLoop(() => {
			controls.update();
			timer.update();
			const ghost1Angle = timer.getElapsed() * 0.5;
			ghost1.position.x = Math.cos(ghost1Angle) * 4;
			ghost1.position.z = Math.sin(ghost1Angle) * 4;
			ghost1.position.y =
				Math.sin(ghost1Angle) *
				Math.sin(ghost1Angle * 2.34) *
				Math.sin(ghost1Angle * 3.45);

			const ghost2Angle = -(timer.getElapsed() * 0.3);
			ghost2.position.x = Math.cos(ghost2Angle) * 6;
			ghost2.position.z = Math.sin(ghost2Angle) * 6;
			ghost2.position.y =
				Math.sin(ghost2Angle) *
				Math.sin(ghost2Angle * 2.34) *
				Math.sin(ghost1Angle * 3.45);

			const ghost3Angle = timer.getElapsed() * 0.15;
			ghost3.position.x = Math.cos(ghost3Angle) * 7;
			ghost3.position.z = Math.sin(ghost3Angle) * 7;
			ghost3.position.y =
				Math.sin(ghost3Angle) *
				Math.sin(ghost3Angle * 2.34) *
				Math.sin(ghost3Angle * 3.45);

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
