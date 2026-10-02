import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCTextFieldCharacterCounterFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function CharacterCounter($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let content = $.state(void 0);
	const SMUITextfieldCharacterCounterMount = getContext('SMUI:textfield:character-counter:mount');
	const SMUITextfieldCharacterCounterUnmount = getContext('SMUI:textfield:character-counter:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCTextFieldCharacterCounterFoundation({
				setContent: (value) => {
					$.set(content, value, true);
				},
				setCounterValue: (currentLength, maxLength) => {}
			}),
			true
		);

		SMUITextfieldCharacterCounterMount && SMUITextfieldCharacterCounterMount($.get(instance));
		$.get(instance).init();

		return () => {
			if (SMUITextfieldCharacterCounterUnmount && $.get(instance)) {
				SMUITextfieldCharacterCounterUnmount($.get(instance));
			}

			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-text-field-character-counter': true,
			[className()]: true
		})
	]);

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