import * as $ from 'svelte/internal/server';

export default function Ll_heading($$renderer, $$props) {
	/**
	 * Lime section heading — regular-weight serif in plum, with an
	 * optional subheading. Mirrors the source "Shop by Category" treatment:
	 * centered by default, 24px serif title, 16px body-tone subtitle.
	 */
	let { title, subtitle, align = 'center', as = 'h2', children } = $$props;

	$$renderer.push(`<div class="ll-heading"${$.attr_style(`text-align: ${$.stringify(align)};`)}>`);

	$.element(
		$$renderer,
		as,
		() => {
			$$renderer.push(` class="ll-heading-title svelte-1t1774b"`);
		},
		() => {
			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(title)}`);
			}

			$$renderer.push(`<!--]-->`);
		}
	);

	$$renderer.push(` `);

	if (subtitle) {
		$$renderer.push(`<!--[0--><p class="ll-heading-sub svelte-1t1774b">${$.escape(subtitle)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}