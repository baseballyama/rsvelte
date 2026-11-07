import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`this fallback content will be rendered when no content is provided, like in the first example`);
	});

	$$renderer.push(`<!--]--></div> `);
	Widget($$renderer, {});
	$$renderer.push(`<!----> `);

	Widget($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<p>this is some child content that will overwrite the default slot content</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}