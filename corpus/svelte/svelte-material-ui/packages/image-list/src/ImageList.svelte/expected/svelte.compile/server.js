import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function ImageList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Whether to use masonry layout.
		 */
		/**
		 * Whether to move the text over the image in a caption area at the bottom.
		 */
		let {
			use = [],
			class: className = '',
			masonry = false,
			withTextProtection = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		setContext('SMUI:label:context', 'image-list');

		function getElement() {
			return element;
		}

		$$renderer.push(`<ul${$.attributes({
			class: $.clsx(classMap({
				'mdc-image-list': true,
				'mdc-image-list--masonry': masonry,
				'mdc-image-list--with-text-protection': withTextProtection,
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
		$.bind_props($$props, { getElement });
	});
}