import * as $ from 'svelte/internal/server';

export default function Swatches($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** Optional array of color swatches to display */
		/** listener, dispatch an event when the user select a swatch color */
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		let { selectSwatch, swatches, texts } = $$props;

		if (swatches) {
			$$renderer.push(`<!--[0--><div class="swatches svelte-33r1sg"${$.attr('aria-label', texts.swatch.ariaTitle)}><!--[-->`);

			const each_array = $.ensure_array_like(swatches);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				$$renderer.push(`<button type="button" class="swatch svelte-33r1sg"${$.attr_style(`background: ${$.stringify(color)}`)}${$.attr('aria-label', texts.swatch.ariaLabel(color))}></button>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}