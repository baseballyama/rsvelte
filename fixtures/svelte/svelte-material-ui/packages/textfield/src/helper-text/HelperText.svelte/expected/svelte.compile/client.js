import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCTextFieldHelperTextFoundation } from './mdc';

let counter = 0;

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'id',
	'persistent',
	'validationMsg',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function HelperText($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The ID of the element.
	 */
	/**
	 * Whether the validation helper text persists even if the input is valid.
	 *
	 * If it is, it will be displayed in the normal (grey) color.
	 */
	/**
	 * Whether the helper text acts as a validation message.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		id = $.prop($$props, 'id', 19, () => 'SMUI-textfield-helper-text-' + counter++),
		persistent = $.prop($$props, 'persistent', 3, false),
		validationMsg = $.prop($$props, 'validationMsg', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalAttrs = $.proxy({});
	let content = $.state(void 0);
	const SMUITextfieldHelperTextId = getContext('SMUI:textfield:helper-text:id');
	const SMUITextfieldHelperTextMount = getContext('SMUI:textfield:helper-text:mount');
	const SMUITextfieldHelperTextUnmount = getContext('SMUI:textfield:helper-text:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCTextFieldHelperTextFoundation({
				addClass,
				removeClass,
				hasClass,
				getAttr,
				setAttr: addAttr,
				removeAttr,
				setContent: (value) => {
					$.set(content, value, true);
				}
			}),
			true
		);

		SMUITextfieldHelperTextId && SMUITextfieldHelperTextId(id());
		SMUITextfieldHelperTextMount && SMUITextfieldHelperTextMount($.get(instance));
		$.get(instance).init();

		return () => {
			if (SMUITextfieldHelperTextUnmount && $.get(instance)) {
				SMUITextfieldHelperTextUnmount($.get(instance));
			}

			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	function hasClass(className) {
		return className in internalClasses
			? internalClasses[className]
			: getElement().classList.contains(className);
	}

	function addClass(className) {
		if (!internalClasses[className]) {
			internalClasses[className] = true;
		}
	}

	function removeClass(className) {
		if (!(className in internalClasses) || internalClasses[className]) {
			internalClasses[className] = false;
		}
	}

	function getAttr(name) {
		return name in internalAttrs
			? internalAttrs[name] ?? null
			: getElement().getAttribute(name);
	}

	function addAttr(name, value) {
		if (internalAttrs[name] !== value) {
			internalAttrs[name] = value;
		}
	}

	function removeAttr(name) {
		if (!(name in internalAttrs) || internalAttrs[name] != null) {
			internalAttrs[name] = undefined;
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			class: $0,
			'aria-hidden': persistent() ? undefined : 'true',
			id: id(),
			...internalAttrs,
			...restProps
		}),
		[
			() => classMap({
				'mdc-text-field-helper-text': true,
				'mdc-text-field-helper-text--persistent': persistent(),
				'mdc-text-field-helper-text--validation-msg': validationMsg(),
				...internalClasses,
				[className()]: true
			})
		]
	);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(content)));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($.get(content) == null) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}