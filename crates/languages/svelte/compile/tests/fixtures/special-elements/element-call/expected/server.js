import * as $ from 'svelte/internal/server';

export default function Element_call($$renderer) {
	function tag() {
		return "p";
	}
	$.element($$renderer, tag(), void 0, () => {
		$$renderer.push(`hello`);
	});
}
