import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const Route = createFileRoute("/shapes")({
	component: RouteComponent,
});

const colors = ["#ef4444", "#f97316", "#eab308"];

const shapeDefinitions = [
	{
		name: "Box",
		createGeometry: (variant: number) =>
			new three.BoxGeometry(0.8 + variant * 0.15, 0.8, 0.8),
	},
	{
		name: "Capsule",
		createGeometry: (variant: number) =>
			new three.CapsuleGeometry(0.35 + variant * 0.05, 0.7, 8, 16),
	},
	{
		name: "Circle",
		createGeometry: (variant: number) =>
			new three.CircleGeometry(0.45 + variant * 0.12, 32),
	},
	{
		name: "Cone",
		createGeometry: (variant: number) =>
			new three.ConeGeometry(0.4 + variant * 0.1, 0.9 + variant * 0.15, 32),
	},
	{
		name: "Cylinder",
		createGeometry: (variant: number) =>
			new three.CylinderGeometry(0.35 + variant * 0.08, 0.45, 1, 32),
	},
	{
		name: "Dodecahedron",
		createGeometry: (variant: number) =>
			new three.DodecahedronGeometry(0.6, variant),
	},
	{
		name: "Extrusion",
		createGeometry: (variant: number) => {
			const shape = new three.Shape();
			shape.moveTo(-0.5, -0.4);
			shape.lineTo(0.5, -0.4);
			shape.lineTo(0.35, 0.4);
			shape.lineTo(-0.35, 0.4);
			shape.closePath();
			return new three.ExtrudeGeometry(shape, {
				depth: 0.2 + variant * 0.15,
				bevelEnabled: true,
				bevelSize: 0.05,
				bevelThickness: 0.05,
			});
		},
	},
	{
		name: "Icosahedron",
		createGeometry: (variant: number) =>
			new three.IcosahedronGeometry(0.6, variant),
	},
	{
		name: "Lathe",
		createGeometry: (variant: number) => {
			const points = Array.from(
				{ length: 8 },
				(_, index) =>
					new three.Vector2(
						0.25 + Math.sin(index * 0.8 + variant * 0.4) * 0.15,
						(index - 3.5) * 0.15,
					),
			);
			return new three.LatheGeometry(points, 16 + variant * 8);
		},
	},
	{
		name: "Octahedron",
		createGeometry: (variant: number) =>
			new three.OctahedronGeometry(0.6, variant),
	},
	{
		name: "Plane",
		createGeometry: (variant: number) =>
			new three.PlaneGeometry(0.85 + variant * 0.1, 0.85),
	},
	{
		name: "Polyhedron",
		createGeometry: (variant: number) =>
			new three.PolyhedronGeometry(
				[1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1],
				[2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1],
				0.65,
				variant,
			),
	},
	{
		name: "Ring",
		createGeometry: (variant: number) =>
			new three.RingGeometry(0.2 + variant * 0.05, 0.55 + variant * 0.08, 32),
	},
	{
		name: "Shape",
		createGeometry: (variant: number) => {
			const shape = new three.Shape();
			shape.moveTo(0, 0.55);
			shape.lineTo(0.55, -0.15);
			shape.lineTo(-0.45, -0.4 + variant * 0.08);
			shape.closePath();
			return new three.ShapeGeometry(shape);
		},
	},
	{
		name: "Sphere",
		createGeometry: (variant: number) =>
			new three.SphereGeometry(0.55 + variant * 0.08, 24, 16),
	},
	{
		name: "Tetrahedron",
		createGeometry: (variant: number) =>
			new three.TetrahedronGeometry(0.65, variant),
	},
	{
		name: "Torus",
		createGeometry: (variant: number) =>
			new three.TorusGeometry(0.4 + variant * 0.08, 0.12, 12, 32),
	},
	{
		name: "Torus Knot",
		createGeometry: (variant: number) =>
			new three.TorusKnotGeometry(0.35, 0.1, 48, 8, 2 + variant, 3),
	},
	{
		name: "Tube",
		createGeometry: (variant: number) => {
			const curve = new three.CatmullRomCurve3([
				new three.Vector3(-0.5, -0.4, 0),
				new three.Vector3(-0.2, 0.35, variant * 0.15),
				new three.Vector3(0.3, -0.2, -variant * 0.15),
				new three.Vector3(0.5, 0.35, 0),
			]);
			return new three.TubeGeometry(curve, 32, 0.08 + variant * 0.02, 8, false);
		},
	},
];

function createLabel(text: string) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 320;
	canvas.height = 64;

	if (!context) return new three.Sprite();

	context.fillStyle = "#ffffff";
	context.font = "bold 32px sans-serif";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(text, canvas.width / 2, canvas.height / 2);

	const texture = new three.CanvasTexture(canvas);
	const material = new three.SpriteMaterial({
		map: texture,
		transparent: true,
	});
	const label = new three.Sprite(material);
	label.scale.set(2.2, 0.44, 1);
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

		const shapes: three.Mesh[] = [];
		const labels: three.Sprite[] = [];
		const columns = 4;
		const columnSpacing = 4.8;
		const rowSpacing = 3.5;
		const offsetX = ((columns - 1) * columnSpacing) / 2;
		const offsetY =
			(Math.ceil(shapeDefinitions.length / columns) - 1) * rowSpacing * 0.5;

		for (const [index, definition] of shapeDefinitions.entries()) {
			const group = new three.Group();
			group.position.set(
				(index % columns) * columnSpacing - offsetX,
				offsetY - Math.floor(index / columns) * rowSpacing,
				0,
			);

			const label = createLabel(definition.name);
			label.position.y = 1.2;
			labels.push(label);
			group.add(label);

			for (const [variant, color] of colors.entries()) {
				const material = new three.MeshStandardMaterial({
					color,
					flatShading: variant === 2,
					side: three.DoubleSide,
				});
				const shape = new three.Mesh(
					definition.createGeometry(variant),
					material,
				);
				shape.position.x = (variant - 1) * 1.35;
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
		camera.position.set(0, 0, 24);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.maxDistance = 40;
		controls.minDistance = 8;

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener("resize", handleResize);

		renderer.setAnimationLoop(() => {
			for (const shape of shapes) {
				shape.rotation.x += 0.008;
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
				shape.geometry.dispose();
				for (const material of Array.isArray(shape.material)
					? shape.material
					: [shape.material]) {
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
