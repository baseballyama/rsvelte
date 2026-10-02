import * as $ from 'svelte/internal/server';

export default function _4_input($$renderer) {
	$$renderer.push(`<div>`);

	$$renderer.push(`<style>
		/* this style tag will be inserted as-is */
		div {
			/* this will apply to all \`<div>\` elements in the DOM */
			color: red;
		}
	</style>`);

	$$renderer.push(`</div>`);
}