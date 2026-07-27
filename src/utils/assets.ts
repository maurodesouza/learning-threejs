export function publicPath(path: string) {
	return `${import.meta.env.BASE_URL}${path}`;
}

export const assets = {
	publicPath,
};
