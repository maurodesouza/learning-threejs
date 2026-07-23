import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const Route = createFileRoute("/paths")({
	component: RouteComponent,
});

const colors = ["#ef4444", "#3b82f6", "#22c55e"];

function create2DShape(variant: number) {
	const scale = 1 - variant * 0.2;
	const shape = new three.Shape();

	if (variant === 1) {
		shape.moveTo(0, 0.8 * scale);
		shape.lineTo(0.4 * scale, 0.2 * scale);
		shape.lineTo(0.2 * scale, 0.2 * scale);
		shape.lineTo(0.2 * scale, -0.6 * scale);
		shape.lineTo(-0.2 * scale, -0.6 * scale);
		shape.lineTo(-0.2 * scale, 0.2 * scale);
		shape.lineTo(-0.4 * scale, 0.2 * scale);
		shape.closePath();
		return shape;
	}

	if (variant === 2) {
		for (let i = 0; i < 10; i++) {
			const angle = (i / 10) * Math.PI * 2;
			const radius = i % 2 === 0 ? 0.7 * scale : 0.3 * scale;
			const x = Math.cos(angle) * radius;
			const y = Math.sin(angle) * radius;
			if (i === 0) shape.moveTo(x, y);
			else shape.lineTo(x, y);
		}
		shape.closePath();
		return shape;
	}

	shape.moveTo(0, 0.6 * scale);
	shape.bezierCurveTo(
		0,
		0.5 * scale,
		-0.5 * scale,
		0,
		-0.5 * scale,
		-0.2 * scale,
	);
	shape.bezierCurveTo(
		-0.5 * scale,
		-0.5 * scale,
		0,
		-0.55 * scale,
		0,
		-0.35 * scale,
	);
	shape.bezierCurveTo(
		0,
		-0.55 * scale,
		0.5 * scale,
		-0.5 * scale,
		0.5 * scale,
		-0.2 * scale,
	);
	shape.bezierCurveTo(0.5 * scale, 0, 0, 0.5 * scale, 0, 0.6 * scale);
	return shape;
}

const pathDefinitions = [
	{
		name: "ShapeGeometry",
		isLine: false,
		createGeometry: (variant: number) =>
			new three.ShapeGeometry(create2DShape(variant)),
	},
	{
		name: "ExtrudeGeometry",
		isLine: false,
		createGeometry: (variant: number) =>
			new three.ExtrudeGeometry(create2DShape(variant), {
				depth: 0.2 + variant * 0.15,
				bevelEnabled: true,
				bevelSize: 0.04,
				bevelThickness: 0.04,
			}),
	},
	{
		name: "Tube LineCurve3",
		isLine: false,
		createGeometry: (variant: number) => {
			const curve = new three.LineCurve3(
				new three.Vector3(-0.8, (variant - 1) * 0.3, 0),
				new three.Vector3(0.8, -(variant - 1) * 0.3, 0),
			);
			return new three.TubeGeometry(curve, 2, 0.12, 8, false);
		},
	},
	{
		name: "Tube QuadraticBezierCurve3",
		isLine: false,
		createGeometry: (variant: number) => {
			const curve = new three.QuadraticBezierCurve3(
				new three.Vector3(-0.8, -0.4, 0),
				new three.Vector3(0, 0.7 + variant * 0.15, 0),
				new three.Vector3(0.8, -0.4, 0),
			);
			return new three.TubeGeometry(curve, 32, 0.1, 8, false);
		},
	},
	{
		name: "Tube CubicBezierCurve3",
		isLine: false,
		createGeometry: (variant: number) => {
			const curve = new three.CubicBezierCurve3(
				new three.Vector3(-0.8, -0.5, 0),
				new three.Vector3(-0.4, 0.7 + variant * 0.2, 0),
				new three.Vector3(0.4, -0.7 - variant * 0.2, 0),
				new three.Vector3(0.8, 0.5, 0),
			);
			return new three.TubeGeometry(curve, 32, 0.1, 8, false);
		},
	},
	{
		name: "Tube CatmullRomCurve3",
		isLine: false,
		createGeometry: (variant: number) => {
			const curve = new three.CatmullRomCurve3(
				[
					new three.Vector3(-0.9, 0, 0),
					new three.Vector3(-0.4, 0.5 + variant * 0.15, 0),
					new three.Vector3(0, -0.4 - variant * 0.15, 0),
					new three.Vector3(0.4, 0.5 + variant * 0.15, 0),
					new three.Vector3(0.9, 0, 0),
				],
				false,
			);
			return new three.TubeGeometry(curve, 48, 0.1, 8, false);
		},
	},
	{
		name: "Tube CurvePath",
		isLine: false,
		createGeometry: (variant: number) => {
			const path = new three.CurvePath<three.Vector3>();
			const h = 0.35 + variant * 0.15;
			path.add(
				new three.LineCurve3(
					new three.Vector3(-0.9, 0, 0),
					new three.Vector3(-0.4, h, 0),
				),
			);
			path.add(
				new three.QuadraticBezierCurve3(
					new three.Vector3(-0.4, h, 0),
					new three.Vector3(0, -h * 1.5, 0),
					new three.Vector3(0.4, h, 0),
				),
			);
			path.add(
				new three.LineCurve3(
					new three.Vector3(0.4, h, 0),
					new three.Vector3(0.9, 0, 0),
				),
			);
			return new three.TubeGeometry(path, 48, 0.1, 8, false);
		},
	},
	{
		name: "Line from Path",
		isLine: true,
		createGeometry: (variant: number) => {
			const curve = new three.CatmullRomCurve3(
				[
					new three.Vector3(-0.8, 0, 0),
					new three.Vector3(-0.3, 0.4 + variant * 0.2, 0),
					new three.Vector3(0.3, -0.4 - variant * 0.2, 0),
					new three.Vector3(0.8, 0, 0),
				],
				false,
			);
			return new three.BufferGeometry().setFromPoints(curve.getPoints(50));
		},
	},
];

function createLabel(text: string) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 340;
	canvas.height = 64;

	if (!context) return new three.Sprite();

	context.fillStyle = "#ffffff";
	context.font = "bold 28px sans-serif";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(text, canvas.width / 2, canvas.height / 2);

	const texture = new three.CanvasTexture(canvas);
	const material = new three.SpriteMaterial({
		map: texture,
		transparent: true,
	});
	const label = new three.Sprite(material);
	label.scale.set(2.6, 0.49, 1);
	return label;
}

function RouteComponent() {
	function init() {
		const container = document.getElementById("scene");
		if (!container) return;

		const renderer = new three.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		const scene = new three.Scene();
		scene.background = new three.Color(0x111827);

		const shapes: three.Object3D[] = [];
		const labels: three.Sprite[] = [];
		const columns = 4;
		const columnSpacing = 5.2;
		const rowSpacing = 3.6;
		const offsetX = ((columns - 1) * columnSpacing) / 2;
		const offsetY =
			(Math.ceil(pathDefinitions.length / columns) - 1) * rowSpacing * 0.5;

		for (const [index, definition] of pathDefinitions.entries()) {
			const group = new three.Group();
			group.position.set(
				(index % columns) * columnSpacing - offsetX,
				offsetY - Math.floor(index / columns) * rowSpacing,
				0,
			);

			const label = createLabel(definition.name);
			label.position.y = 1.35;
			labels.push(label);
			group.add(label);

			for (const [variant, color] of colors.entries()) {
				const geometry = definition.createGeometry(variant);
				const shape = definition.isLine
					? new three.Line(
							geometry,
							new three.LineBasicMaterial({ color, linewidth: 2 }),
						)
					: new three.Mesh(
							geometry,
							new three.MeshStandardMaterial({
								color,
								side: three.DoubleSide,
								flatShading: variant === 2,
							}),
						);
				shape.position.x = (variant - 1) * 1.4;
				shapes.push(shape);
				group.add(shape);
			}

			scene.add(group);
		}

		const ambientLight = new three.HemisphereLight(0xffffff, 0x1e293b, 2);
		const directionalLight = new three.DirectionalLight(0xffffff, 3);
		directionalLight.position.set(5, 8, 10);
		scene.add(ambientLight, directionalLight);

		const camera = new three.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.1,
			100,
		);
		camera.position.set(0, 0, 26);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.minDistance = 8;
		controls.maxDistance = 40;

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener("resize", handleResize);

		renderer.setAnimationLoop(() => {
			for (const shape of shapes) {
				shape.rotation.x += 0.006;
				shape.rotation.y += 0.01;
			}
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			window.removeEventListener("resize", handleResize);
			renderer.setAnimationLoop(null);
			controls.dispose();
			for (const shape of shapes) {
				const mesh = shape as three.Mesh | three.Line;
				mesh.geometry.dispose();
				for (const material of Array.isArray(mesh.material)
					? mesh.material
					: [mesh.material]) {
					material.dispose();
				}
			}
			for (const label of labels) {
				label.material.map?.dispose();
				label.material.dispose();
			}
			renderer.dispose();
			renderer.domElement.remove();
		};
	}

	useEffect(() => init(), []);

	return <div id="scene"></div>;
}
