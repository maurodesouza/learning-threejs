import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import React, { useState } from "react";

import { Home } from "../components/home";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const [remountKey, setRemountKey] = useState(0);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased wrap-anywhere selection:bg-[rgba(79,184,178,0.24)]">
				<React.Fragment key={remountKey}>{children}</React.Fragment>
				<Home />
				{pathname !== "/" && (
					<button
						type="button"
						onClick={() => setRemountKey((key) => key + 1)}
						className="fixed top-4 left-24 z-50 rounded-md bg-white/90 px-4 py-2 font-semibold text-slate-900 shadow-md transition hover:bg-white"
					>
						Reload
					</button>
				)}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
