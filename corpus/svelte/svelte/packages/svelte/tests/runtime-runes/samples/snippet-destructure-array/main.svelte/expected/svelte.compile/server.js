import * as $ from 'svelte/internal/server';

function content($$renderer, [x]) {
	$$renderer.push(`<!---->${$.escape(x)}`);
}

export default function Main($$renderer) {
	let array = ['a', 'b', 'c'];

	content($$renderer, array);
}