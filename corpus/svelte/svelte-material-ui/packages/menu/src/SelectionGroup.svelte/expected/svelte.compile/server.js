import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';

export default function SelectionGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		let {
			use = [],
			list$use = [],
			list$class = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		setContext('SMUI:list:graphic:menu-selection-group', true);

		function getElement() {
			return element;
		}

		$$renderer.push(`<li${$.attributes({ ...exclude(restProps, ['list$']) })}><ul${$.attributes({
			class: $.clsx(classMap({ 'mdc-menu__selection-group': true, [list$class]: true })),
			...prefixFilter(restProps, 'list$')
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul></li>`);
		$.bind_props($$props, { getElement });
	});
}