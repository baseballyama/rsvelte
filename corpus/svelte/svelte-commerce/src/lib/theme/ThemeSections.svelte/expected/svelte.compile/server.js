import * as $ from 'svelte/internal/server';
import { SECTIONS } from './sections/index.js';

export default function ThemeSections($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Renders a theme's homepage from its layout: an ordered list of section types with options,
		 * served by the API. The storefront supplies the section components and the live commerce
		 * data; the theme supplies the order, the settings and the stylesheet.
		 *
		 * An unknown section type is skipped rather than thrown, so a layout authored against a
		 * newer section library degrades to the sections this build knows instead of a blank page.
		 */
		let { layout, ctx } = $$props;

		const sections = $.derived(() => (layout?.sections ?? []).filter((section) => {
			const known = !!SECTIONS[section.type];

			if (!known && typeof console !== 'undefined') {
				console.warn(`[theme] unknown section type "${section.type}" — skipped`);
			}

			return known;
		}));

		$$renderer.push(`<div${$.attr_class(`ts-home ${$.stringify(layout?.rootClass ?? '')}`)}><!--[-->`);

		const each_array = $.ensure_array_like(sections());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let section = each_array[index];
			const Section = SECTIONS[section.type];

			if (Section) {
				$$renderer.push('<!--[-->');
				Section($$renderer, { ctx, options: section.options ?? {} });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--></div>`);
	});
}