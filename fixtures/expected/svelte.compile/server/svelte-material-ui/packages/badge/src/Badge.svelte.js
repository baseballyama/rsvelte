import * as $ from 'svelte/internal/server';
import { classMap, useActions } from '@smui/common/internal';

export default function Badge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Square off the corners, instead of rounding them.
		 */
		/**
		 * The color of the badge.
		 */
		/**
		 * The position of the badge relative to the edge/corner it is aligned to.
		 */
		/**
		 * The edge or corner to align the badge to.
		 */
		let {
			use = [],
			class: className = '',
			square = false,
			color = 'primary',
			position = 'middle',
			align = 'top-end',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		function getElement() {
			return element;
		}

		$$renderer.push(`<span${$.attributes({
			class: $.clsx(classMap({
				'smui-badge': true,
				'smui-badge--rounded': !square,
				['smui-badge--color-' + color]: true,
				['smui-badge--position-' + position]: true,
				['smui-badge--align-' + align]: true,
				[className]: true
			})),
			role: 'status',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span>`);
		$.bind_props($$props, { getElement });
	});
}