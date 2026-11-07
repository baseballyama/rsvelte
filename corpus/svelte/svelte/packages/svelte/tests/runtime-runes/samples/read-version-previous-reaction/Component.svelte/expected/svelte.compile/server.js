import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { label = 0, size = 0 } = $$props;
		const title = $.derived(() => size.toString());

		$$renderer.push(`<p${$.attr('title', title())}>${$.escape(label)}</p>`);
	});
}