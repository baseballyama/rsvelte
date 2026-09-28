import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function Section($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Where to align the element.
		 */
		/**
		 * Whether this section acts as a toolbar.
		 */
		let {
			use = [],
			class: className = '',
			align = 'start',
			toolbar = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		setContext('SMUI:icon-button:context', toolbar ? 'top-app-bar:action' : 'top-app-bar:navigation');
		setContext('SMUI:button:context', toolbar ? 'top-app-bar:action' : 'top-app-bar:navigation');

		function getElement() {
			return element;
		}

		$$renderer.push(`<section${$.attributes({
			class: $.clsx(classMap({
				'mdc-top-app-bar__section': true,
				'mdc-top-app-bar__section--align-start': align === 'start',
				'mdc-top-app-bar__section--align-end': align === 'end',
				[className]: true
			})),
			...toolbar ? { role: 'toolbar' } : {},
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></section>`);
		$.bind_props($$props, { getElement });
	});
}