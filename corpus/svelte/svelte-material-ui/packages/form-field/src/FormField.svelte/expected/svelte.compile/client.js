import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext } from 'svelte';

import {
	classMap,
	exclude,
	prefixFilter,
	useActions,
	SvelteEventManager
} from '@smui/common/internal';

import { MDCFormFieldFoundation } from './mdc';

let counter = 0;

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'align',
	'justify',
	'noWrap',
	'inputId',
	'label$use',
	'label$class',
	'children',
	'label'
]);

var root = $.from_html(`<div><!> <label><!></label></div>`);

export default function FormField($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Where to align the input.
	 */
	/**
	 * How to justify the label and input.
	 */
	/**
	 * Whether to prevent content wrapping.
	 */
	/**
	 * The ID the input will use.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The content of the form field's label.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		align = $.prop($$props, 'align', 3, 'start'),
		justify = $.prop($$props, 'justify', 3, 'normal'),
		noWrap = $.prop($$props, 'noWrap', 3, false),
		inputId = $.prop($$props, 'inputId', 19, () => 'SMUI-form-field-' + counter++),
		label$use = $.prop($$props, 'label$use', 19, () => []),
		label$class = $.prop($$props, 'label$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let labelEl;
	let input = $.state(void 0);

	setContext('SMUI:generic:input:props', { id: inputId() });

	setContext('SMUI:generic:input:mount', (accessor) => {
		$.set(input, accessor, true);
	});

	setContext('SMUI:generic:input:unmount', () => {
		$.set(input, undefined);
	});

	onMount(() => {
		$.set(
			instance,
			new MDCFormFieldFoundation({
				activateInputRipple: () => {
					if ($.get(input)) {
						$.get(input).activateRipple();
					}
				},

				deactivateInputRipple: () => {
					if ($.get(input)) {
						$.get(input).deactivateRipple();
					}
				},
				deregisterInteractionHandler: (evtType, handler) => eventManager.off(labelEl, evtType, handler),
				registerInteractionHandler: (evtType, handler) => eventManager.on(labelEl, evtType, handler)
			}),
			true
		);

		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
			eventManager.clear();
		};
	});

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(div, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'mdc-form-field': true,
			'mdc-form-field--align-end': align() === 'end',
			'mdc-form-field--space-between': justify() === 'space-between',
			'mdc-form-field--nowrap': noWrap(),
			[className()]: true
		}),
		() => exclude(restProps, ['label$'])
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);

	var label_1 = $.sibling(node, 2);

	$.attribute_effect(label_1, ($0, $1) => ({ class: $0, for: inputId(), ...$1 }), [
		() => classMap({ 'mdc-label': true, [label$class()]: true }),
		() => prefixFilter(restProps, 'label$')
	]);

	var node_1 = $.child(label_1);

	$.snippet(node_1, () => $$props.label ?? $.noop);
	$.reset(label_1);
	$.bind_this(label_1, ($$value) => labelEl = $$value, () => labelEl);
	$.action(label_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), label$use);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}