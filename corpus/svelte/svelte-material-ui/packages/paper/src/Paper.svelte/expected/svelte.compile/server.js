import * as $ from 'svelte/internal/server';
import { classMap, useActions } from '@smui/common/internal';

export default function Paper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The visual variant of the Paper.
		 */
		/**
		 * When true, removes the rounded corners.
		 */
		/**
		 * The color styling to apply to the Paper.
		 *
		 * Default, primary, and secondary are provided by SMUI. You can use custom
		 * scss styling to add your own color styling.
		 */
		/**
		 * The elevation styling to apply to the Paper.
		 */
		/**
		 * Whether transition animation styling should be applied to the Paper.
		 */
		let {
			use = [],
			class: className = '',
			variant = 'raised',
			square = false,
			color = 'default',
			elevation = 1,
			transition = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'smui-paper': true,
				'smui-paper--raised': variant === 'raised',
				'smui-paper--unelevated': variant === 'unelevated',
				'smui-paper--outlined': variant === 'outlined',
				['smui-paper--elevation-z' + elevation]: elevation !== 0 && variant === 'raised',
				'smui-paper--rounded': !square,
				['smui-paper--color-' + color]: color !== 'default',
				'smui-paper-transition': transition,
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { getElement });
	});
}