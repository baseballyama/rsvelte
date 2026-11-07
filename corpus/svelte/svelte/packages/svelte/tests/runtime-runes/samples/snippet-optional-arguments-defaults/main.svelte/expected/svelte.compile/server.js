import * as $ from 'svelte/internal/server';

function one($$renderer, a, b = 1, c = (2, 3)) {
	$$renderer.push(`<!---->${$.escape(a)}${$.escape(b)}${$.escape(c)}`);
}

function two($$renderer, a, b = (1, 2), c = 3) {
	$$renderer.push(`<!---->${$.escape(a)}${$.escape(b)}${$.escape(c)}`);
}

export default function Main($$renderer) {
	one($$renderer, 0);
	$$renderer.push(`<!---->/`);
	two($$renderer, 0);
	$$renderer.push(`<!---->`);
}