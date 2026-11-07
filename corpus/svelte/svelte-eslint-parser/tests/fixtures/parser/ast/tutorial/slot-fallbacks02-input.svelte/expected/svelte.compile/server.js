import * as $ from 'svelte/internal/server';

export default function Slot_fallbacks02_input($$renderer, $$props) {
	$$renderer.push(`<div class="box svelte-1tfoi6s"><!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<em>no content was provided</em>`);
	});

	$$renderer.push(`<!--]--></div>`);
}