import * as $ from 'svelte/internal/server';

function children($$renderer) {
	$$renderer.push(`<!---->Hello`);
}

export default function Standalone_snippet01_input($$renderer) {
	children($$renderer);
}