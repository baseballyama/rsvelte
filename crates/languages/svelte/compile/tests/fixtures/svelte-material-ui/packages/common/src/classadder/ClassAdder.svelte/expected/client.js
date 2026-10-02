import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, getContext, setContext } from 'svelte';
import { classMap } from '../internal/classMap.js';
import { SmuiElement } from '../index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'component',
	'tag',
	'_smuiClass',
	'_smuiClassMap',
	'_smuiContexts',
	'_smuiProps',
	'children'
]);

export default function ClassAdder($$anchor, $$props) {
	$.push($$props, true);

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 3, 'div'),
		_smuiClass = $.prop($$props, '_smuiClass', 3, ''),
		_smuiClassMap = $.prop($$props, '_smuiClassMap', 23, () => ({})),
		_smuiContexts = $.prop($$props, '_smuiContexts', 19, () => ({})),
		_smuiProps = $.prop($$props, '_smuiProps', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	const smuiClassUnsubscribes = [];

	Object.entries(_smuiClassMap()).forEach(([name, context]) => {
		const store = getContext(context);

		if (store && 'subscribe' in store) {
			smuiClassUnsubscribes.push(store.subscribe((value) => {
				_smuiClassMap()[name] = value;
			}));
		}
	});

	for (let context in _smuiContexts()) {
		if (_smuiContexts().hasOwnProperty(context)) {
			setContext(context, _smuiContexts()[context]);
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

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => classMap({
			[_smuiClass()]: true,
			..._smuiClassMap(),
			[className()]: true
		}));

		$.component(node, MyComponent, ($$anchor, MyComponent_1) => {
			$.bind_this(
				MyComponent_1($$anchor, $.spread_props(
					{
						get tag() {
							return tag();
						},

						get use() {
							return use();
						},

						get class() {
							return $.get($0);
						}
					},
					_smuiProps,
					() => restProps,
					{
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_1 = $.first_child(fragment_1);

							$.snippet(node_1, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}
				)),
				($$value) => element = $$value,
				() => element
			);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}