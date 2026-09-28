import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);
	const { $$slots: $$slots_, $$events, ...props } = $$props;

	$$renderer.push(`<p>${$.escape(Object.keys(props))}</p> `);

	if ($$slots.foo) {
		$$renderer.push(`<!--[0--><p>foo exists</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}