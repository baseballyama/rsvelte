import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { classMap } from './internal/index.js';
import { SmuiElement } from './index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'component',
	'tag',
	'children'
]);

export default function CommonLabel($$anchor, $$props) {
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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 3, 'span'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	const context = getContext('SMUI:label:context');
	const tabindex = getContext('SMUI:label:tabindex');

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => classMap({
			'mdc-button__label': context === 'button',
			'mdc-fab__label': context === 'fab',
			'mdc-tab__text-label': context === 'tab',
			'mdc-image-list__label': context === 'image-list',
			'mdc-snackbar__label': context === 'snackbar',
			'mdc-banner__text': context === 'banner',
			'mdc-segmented-button__label': context === 'segmented-button',
			'mdc-data-table__pagination-rows-per-page-label': context === 'data-table:pagination',
			'mdc-data-table__header-cell-label': context === 'data-table:sortable-header-cell',
			'mdc-tooltip__label': context === 'tooltip',
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
					() => context === 'snackbar' ? { 'aria-atomic': 'false' } : {},
					{
						get tabindex() {
							return tabindex;
						}
					},
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