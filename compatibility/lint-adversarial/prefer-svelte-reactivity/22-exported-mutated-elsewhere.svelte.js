export const cache = new Map();
const hidden = new Set();
let later;
later = new Date();

export default hidden;

export function touch() {
	cache.set(1, 2);
	hidden.add(1);
	later.setHours(0);
}

const notExported = new URL('https://x.y');
notExported.hash = '#a';

export { later as stamp };
