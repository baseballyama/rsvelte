import * as $ from 'svelte/internal/server';
import { classMap, useActions } from '@smui/common/internal';

export default function Media($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Force an aspect ratio.
		 */
		let {
			use = [],
			class: className = '',
			aspectRatio,
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
				'mdc-card__media': true,
				'mdc-card__media--square': aspectRatio === 'square',
				'mdc-card__media--16-9': aspectRatio === '16x9',
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { getElement });
	});
}