import * as $ from 'svelte/internal/server';

function one($$renderer) {
	two($$renderer);
}

function two($$renderer) {
	$$renderer.push(`<!---->hello`);
}

const message = 'hello';

export { one };

export default function Child($$renderer) {}