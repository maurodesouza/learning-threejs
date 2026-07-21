import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main className="page-wrap p-8">
			<Link to="/simple-renderer">Simple Renderer</Link>
		</main>
	);
}
