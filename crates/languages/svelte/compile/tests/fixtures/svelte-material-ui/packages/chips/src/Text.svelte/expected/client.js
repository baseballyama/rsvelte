import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext, tick } from 'svelte';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';
import Checkmark from './Checkmark.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'tabindex',
	'children',
	'checkbox'
]);

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<span><span><!></span></span>`);
var root_2 = $.from_html(`<!> <span><!></span>`, 1);

export default function Text($$anchor, $$props) {
	$.push($$props, true);

	const $filter = () => $.store_get(filter, '$filter', $$stores);
	const $choice = () => $.store_get(choice, '$choice', $$stores);
	const $nonInteractive = () => $.store_get(nonInteractive, '$nonInteractive', $$stores);
	const $isSelected = () => $.store_get(isSelected, '$isSelected', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The tab index.
	 */
	/**
	 * A spot for the checkbox icon.
	 *
	 * You probably shouldn't customize this.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		tabindex = $.prop($$props, 'tabindex', 19, () => getContext('SMUI:chips:chip:focusable') ? 0 : -1),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let input = undefined;
	let primaryAction = undefined;
	let internalAttrs = $.proxy({});
	const nonInteractive = getContext('SMUI:chips:nonInteractive');
	const choice = getContext('SMUI:chips:choice');
	const filter = getContext('SMUI:chips:filter');
	const isSelected = getContext('SMUI:chips:chip:isSelected');

	const roleProps = $.derived(() => ({
		role: $filter() ? 'checkbox' : $choice() ? 'radio' : 'button',
		tabindex: tabindex()
	}));

	const SMUIChipsPrimaryActionMount = getContext('SMUI:chips:primary-action:mount');
	const SMUIChipsPrimaryActionUnmount = getContext('SMUI:chips:primary-action:unmount');

	onMount(() => {
		let accessor = { focus, addAttr };

		SMUIChipsPrimaryActionMount && SMUIChipsPrimaryActionMount(accessor);

		return () => {
			SMUIChipsPrimaryActionUnmount && SMUIChipsPrimaryActionUnmount(accessor);
		};
	});

	function addAttr(name, value) {
		if (internalAttrs[name] !== value) {
			internalAttrs[name] = value;
		}
	}

	function waitForTabindex(fn) {
		if (internalAttrs['tabindex'] !== getElement().getAttribute('tabindex')) {
			tick().then(fn);
		} else {
			fn();
		}
	}

	function focus() {
		// Let the tabindex change propagate.
		waitForTabindex(() => {
			primaryAction && primaryAction.focus();
		});
	}

	function getInput() {
		return input && input.getElement();
	}

	function getElement() {
		return element;
	}

	var $$exports = { focus, getInput, getElement };
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => prefixFilter(restProps, 'checkmark$'));

				$.bind_this(
					Checkmark($$anchor, $.spread_props(
						{
							get children() {
								return $$props.checkbox;
							}
						},
						() => $.get($0)
					)),
					($$value) => input = $$value,
					() => input
				);
			}
		};

		$.if(node, ($$render) => {
			if ($filter()) $$render(consequent);
		});
	}

	var span = $.sibling(node, 2);

	$.attribute_effect(span, ($0) => ({ role: 'gridcell', ...$0 }), [() => prefixFilter(restProps, 'container$')]);

	var node_1 = $.child(span);

	{
		var consequent_1 = ($$anchor) => {
			var span_1 = root();

			$.attribute_effect(span_1, ($0) => ({ class: 'mdc-chip__text', ...$0 }), [() => prefixFilter(restProps, 'text$')]);

			var node_2 = $.child(span_1);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(span_1);
			$.append($$anchor, span_1);
		};

		var alternate = ($$anchor) => {
			var span_2 = root_1();

			$.attribute_effect(
				span_2,
				($0, $1) => ({
					class: $0,
					...$filter() || $choice()
						? { 'aria-selected': $isSelected() ? 'true' : 'false' }
						: {},
					...$.get(roleProps),
					...internalAttrs,
					...$1
				}),
				[
					() => classMap({ 'mdc-chip__primary-action': true, [className()]: true }),
					() => exclude(restProps, ['checkmark$', 'container$', 'text$'])
				]
			);

			var span_3 = $.child(span_2);

			$.attribute_effect(span_3, ($0) => ({ class: 'mdc-chip__text', ...$0 }), [() => prefixFilter(restProps, 'text$')]);

			var node_3 = $.child(span_3);

			$.snippet(node_3, () => $$props.children ?? $.noop);
			$.reset(span_3);
			$.reset(span_2);
			$.bind_this(span_2, ($$value) => primaryAction = $$value, () => primaryAction);
			$.append($$anchor, span_2);
		};

		$.if(node_1, ($$render) => {
			if ($nonInteractive()) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(span);
	$.bind_this(span, ($$value) => element = $$value, () => element);
	$.action(span, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}