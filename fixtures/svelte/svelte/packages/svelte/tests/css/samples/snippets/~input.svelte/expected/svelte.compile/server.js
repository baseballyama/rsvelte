import * as $ from 'svelte/internal/server';

function my_snippet($$renderer) {
	$$renderer.push(`<span class="svelte-e63w81">Hello world</span>`);
}

export default function Input($$renderer) {
	function my_snippet($$renderer) {
		$$renderer.push(`<span class="svelte-e63w81">Hello world</span>`);
	}

	$$renderer.push(`<div class="svelte-e63w81">`);
	my_snippet($$renderer);
	$$renderer.push(`<!----></div> <p class="svelte-e63w81"><strong>`);
	my_snippet($$renderer);
	$$renderer.push(`<!----></strong></p>`);
}