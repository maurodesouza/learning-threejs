import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main className="page-wrap p-8">
			<nav className="flex gap-8">
				<Link to="/simple-renderer">Simple Renderer</Link>
				<Link to="/lighting">Lighting</Link>
				<Link to="/debugger">Debugger</Link>
				<Link to="/shapes">Shapes</Link>
				<Link to="/sides">Material Sides</Link>
				<Link to="/paths">Paths</Link>
				<Link to="/lights">Lights</Link>
			</nav>
		</main>
	);
}
