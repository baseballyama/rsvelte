import * as $ from 'svelte/internal/server';
import { classMap } from '@smui/common/internal';
import { SmuiElement } from '@smui/common';

export default function AutoAdjust($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The Top App Bar that this auto adjuster is for.
		 *
		 * This is REQUIRED! The reason you can provide `null` is so that the
		 * Top App Bar has a chance to mount, then you must provide it.
		 */
		/**
		 * The component to use to render the element.
		 */
		/**
		 * The tag name of the element to create.
		 */
		let {
			use = [],
			class: className = '',
			topAppBar = null,
			component: MyComponent = SmuiElement,
			tag = 'main',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		const propStore = $.derived(() => topAppBar && topAppBar.getPropStore());

		const adjustClass = $.derived(() => {
			if (!propStore() || !$.store_get($$store_subs ??= {}, '$propStore', propStore()) || $.store_get($$store_subs ??= {}, '$propStore', propStore()).variant === 'static') {
				return '';
			}

			if ($.store_get($$store_subs ??= {}, '$propStore', propStore()).variant === 'short') {
				return 'mdc-top-app-bar--short-fixed-adjust';
			}

			if ($.store_get($$store_subs ??= {}, '$propStore', propStore()).prominent && $.store_get($$store_subs ??= {}, '$propStore', propStore()).dense) {
				return 'mdc-top-app-bar--dense-prominent-fixed-adjust';
			}

			if ($.store_get($$store_subs ??= {}, '$propStore', propStore()).prominent) {
				return 'mdc-top-app-bar--prominent-fixed-adjust';
			}

			if ($.store_get($$store_subs ??= {}, '$propStore', propStore()).dense) {
				return 'mdc-top-app-bar--dense-fixed-adjust';
			}

			return 'mdc-top-app-bar--fixed-adjust';
		});

		function getElement() {
			return element.getElement();
		}

		if (MyComponent) {
			$$renderer.push('<!--[-->');

			MyComponent($$renderer, $.spread_props([
				{
					tag,
					use,
					class: classMap({ [adjustClass()]: true, [className]: true })
				},
				restProps,
				{
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getElement });
	});
}