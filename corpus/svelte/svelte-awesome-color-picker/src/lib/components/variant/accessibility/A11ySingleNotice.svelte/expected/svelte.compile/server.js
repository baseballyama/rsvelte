import * as $ from 'svelte/internal/server';
import { isGradeAchieved } from './grades.js';

export default function A11ySingleNotice($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** placeholder, falls back to `Lorem Ipsum` */
		/** size of the text */
		/** required WCAG contrast level */
		/** placeholder text color */
		/** placeholder background color */
		/** RGAA contrast between the text and its background. Between 1 and 21 */
		/** define the accessibility "contrast" text */
		let {
			placeholder = undefined,
			size = undefined,
			a11yLevel,
			textColor,
			bgColor,
			contrast = 1,
			contrastText
		} = $$props;

		$$renderer.push(`<p${$.attr_class('lorem svelte-ybn3ap', void 0, { 'large': size === 'large' })}${$.attr_style('', { color: textColor, 'background-color': bgColor })}>${$.escape(placeholder || 'Lorem Ipsum')}</p> <div><p class="svelte-ybn3ap">${$.escape(contrastText)} ${$.escape(contrast >= 10 ? contrast.toFixed(1) : contrast)}</p> <span${$.attr_class('grade svelte-ybn3ap', void 0, { 'grade-ok': isGradeAchieved(contrast, size, 'AA') })}>AA</span> `);

		if (a11yLevel === 'AAA') {
			$$renderer.push(`<!--[0--><span${$.attr_class('grade svelte-ybn3ap', void 0, { 'grade-ok': isGradeAchieved(contrast, size, 'AAA') })}>AAA</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}