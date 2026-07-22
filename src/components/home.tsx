import { Link, useRouterState } from "@tanstack/react-router";

export function Home() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	if (pathname === "/") return null;

	return (
		<Link
			to="/"
			className="fixed top-4 left-4 z-50 rounded-md bg-white/90 px-4 py-2 font-semibold text-slate-900 shadow-md transition hover:bg-white"
		>
			Home
		</Link>
	);
}
