import * as $ from 'svelte/internal/server';
import { defaultA11yTexts } from '$lib/utils/texts.js';
import { extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { getNumberOfGradeFailed } from './grades.js';
import { getContrast } from '$lib/utils/colors.js';

export default function A11yNotice($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** customize the ColorPicker component parts. Can be used to display a Chrome variant or an Accessibility Notice */
		/** hex color */
		/** define the accessibility examples in the color picker */
		/** required WCAG contrast level */
		/** all a11y translation tokens used in the library; override with translations if necessary; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		let {
			components,
			hex,
			a11yColors,
			a11yLevel,
			a11yTexts = undefined
		} = $$props;

		extend([a11yPlugin]);

		function getTexts() {
			return { ...defaultA11yTexts, ...a11yTexts };
		}

		let _a11yColors = $.derived(() => a11yColors.map((a11yColor) => getContrast(a11yColor, hex)).filter(Boolean).map((x) => x));
		let count = $.derived(() => _a11yColors().map((color) => getNumberOfGradeFailed(color, a11yLevel)).reduce((acc, c) => acc + c));

		$$renderer.push(`<div class="a11y-notice svelte-1j34xld"${$.attr_style('', { '--item-count': _a11yColors().length })}><span class="title svelte-1j34xld">${$.escape(getTexts().nbGradeSummary(count()))}</span> <!--[-->`);

		const each_array = $.ensure_array_like(_a11yColors());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { trueColors, contrast, placeholder, size } = each_array[$$index];

			if (components.a11ySingleNotice) {
				$$renderer.push('<!--[-->');

				components.a11ySingleNotice($$renderer, $.spread_props([
					trueColors,
					{
						contrast,
						placeholder,
						size,
						a11yLevel,
						contrastText: getTexts().contrast
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> `);

		if (getTexts().guidelines) {
			$$renderer.push(`<!--[0--><span class="guidelines svelte-1j34xld">${$.html(getTexts().guidelines)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}