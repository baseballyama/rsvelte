import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	if ($$slots.default) {
		$$renderer.push(`<!--[0--><div><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}