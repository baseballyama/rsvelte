export const cache = new Map();

export default new Date();

const internal = new Set();
internal.add(1);

const silent = new Map();

export function inspect() {
	return { cache, internal, silent };
}
