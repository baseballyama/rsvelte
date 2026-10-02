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
		 * A list of CSS styles.
		 */
		/**
		 * The Bottom App Bar that this auto adjuster is for.
		 *
		 * This is REQUIRED! The reason you can provide `null` is so that the
		 * Bottom App Bar has a chance to mount, then you must provide it.
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
			style = '',
			bottomAppBar = null,
			component: MyComponent = SmuiElement,
			tag = 'main',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let internalStyles = {};
		const propStore = $.derived(() => bottomAppBar && bottomAppBar.getPropStore());

		const adjustClass = $.derived(() => {
			if (!propStore() || !$.store_get($$store_subs ??= {}, '$propStore', propStore()) || $.store_get($$store_subs ??= {}, '$propStore', propStore()).variant === 'static') {
				return '';
			}

			return `smui-bottom-app-bar--${$.store_get($$store_subs ??= {}, '$propStore', propStore()).variant}-adjust ${$.store_get($$store_subs ??= {}, '$propStore', propStore()).withFab ? 'smui-bottom-app-bar--with-fab' : ''}`;
		});

		function addStyle(name, value) {
			if (internalStyles[name] != value) {
				if (value === '' || value == null) {
					delete internalStyles[name];
				} else {
					internalStyles[name] = value;
				}
			}
		}

		function getElement() {
			return element.getElement();
		}

		if (MyComponent) {
			$$renderer.push('<!--[-->');

			MyComponent($$renderer, $.spread_props([
				{
					tag,
					use,
					class: classMap({ [adjustClass()]: true, [className]: true }),
					style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' ')
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