import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.element($$renderer, "script", void 0, () => {
		$$renderer.push(`{}`);
	});
}