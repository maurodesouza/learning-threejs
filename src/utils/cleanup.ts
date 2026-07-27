import * as three from "three";

export function disposeScene(scene: three.Scene) {
	scene.traverse((object) => {
		if (object instanceof three.Mesh) {
			object.geometry.dispose();

			if (Array.isArray(object.material)) {
				for (const material of object.material) material.dispose();
			} else {
				object.material.dispose();
			}
		}
	});

	scene.clear();
}

export function disposeRenderer(renderer: three.WebGLRenderer) {
	renderer.setAnimationLoop(null);
	renderer.dispose();
	renderer.domElement.remove();
	renderer.forceContextLoss();
}

export function createCleanup(
	...cleanups: Array<(() => void) | undefined | null>
) {
	return () => {
		for (const cleanup of cleanups) cleanup?.();
	};
}
