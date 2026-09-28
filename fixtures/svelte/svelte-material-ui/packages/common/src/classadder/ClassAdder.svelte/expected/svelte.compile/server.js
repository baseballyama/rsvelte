import * as $ from 'svelte/internal/server';
import { onDestroy, getContext, setContext } from 'svelte';
import { classMap } from '../internal/classMap.js';
import { SmuiElement } from '../index.js';

export default function ClassAdder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The component to use to render the element.
		 */
		/**
		 * The tag name of the element to create.
		 */
		/**
		 * Class to add to the component.
		 *
		 * Do not provide this yourself.
		 */
		/**
		 * Map of name to context name. The context should resolve to a Svelte
		 * store, and the class will be added if the Svelte store's value is true.
		 *
		 * Do not provide this yourself.
		 */
		/**
		 * Map of contexts to set.
		 *
		 * Do not provide this yourself.
		 */
		/**
		 * Props to add to the element.
		 *
		 * Do not provide this yourself.
		 */
		let {
			use = [],
			class: className = '',
			component: MyComponent = SmuiElement,
			tag = 'div',
			_smuiClass = '',
			_smuiClassMap = {},
			_smuiContexts = {},
			_smuiProps = {},
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		const smuiClassUnsubscribes = [];

		Object.entries(_smuiClassMap).forEach(([name, context]) => {
			const store = getContext(context);

			if (store && 'subscribe' in store) {
				smuiClassUnsubscribes.push(store.subscribe((value) => {
					_smuiClassMap[name] = value;
				}));
			}
		});

		for (let context in _smuiContexts) {
			if (_smuiContexts.hasOwnProperty(context)) {
				setContext(context, _smuiContexts[context]);
			}
		}

		onDestroy(() => {
			for (const unsubscribe of smuiClassUnsubscribes) {
				unsubscribe();
			}
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
					class: classMap({ [_smuiClass]: true, ..._smuiClassMap, [className]: true })
				},
				_smuiProps,
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

		$.bind_props($$props, { getElement });
	});
}