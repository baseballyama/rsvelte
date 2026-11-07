import * as $ from 'svelte/internal/server';

export default function Builtin_vars01_input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'title', {}, null);
	$$renderer.push(`<!--]--> `);

	if ($$slots.description) {
		$$renderer.push(`<!--[0--><hr/> <!--[-->`);
		$.slot($$renderer, $$props, 'description', {}, null);
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}