import * as $ from 'svelte/internal/server';

function head($$renderer) {
	$$renderer.push(`<title>Cool</title>`);
}

export default function Main($$renderer) {
	$.head('1hoxzs8', $$renderer, ($$renderer) => {
		head($$renderer);
	});
}