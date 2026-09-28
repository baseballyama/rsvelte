import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import { Textarea } from '$lib/components/ui/textarea';
import { serializeEvent } from './utils';
import { imperativeBus } from '$lib/imperative.svelte';
import { getContext, untrack } from 'svelte';

var root = $.from_html(`<p class="mt-1 text-xs text-red-600"> </p>`);
var root_1 = $.from_html(`<p class="mt-1 text-xs text-gray-500"> </p>`);
var root_2 = $.from_html(`<div class="flex gap-4"><label class="text-muted-foreground pt-2 text-right text-sm font-medium"> </label> <div class="w-full"><!> <!> <!></div></div>`);

export default function TextArea($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: 'Form.TextArea'
		}))),
		componentProps = $.derived(() => $.get($$d).props);

	const { register } = getContext('form-context');
	const isControlled = $.derived(() => $.get(componentProps)?.value !== undefined);
	let internalValue = $.state('');
	let isInitialized = false;
	let textareaRef = $.state(null);

	$.user_effect(() => {
		if ($.get(componentProps) && !isInitialized && !$.get(isControlled)) {
			$.set(internalValue, $.get(componentProps).defaultValue ?? '', true);
			isInitialized = true;
		}
	});

	const displayValue = $.derived(() => $.get(isControlled) ? $.get(componentProps)?.value : $.get(internalValue));

	$.user_effect(() => {
		if ($.get(componentProps)) {
			register($.get(componentProps).id, $.get(displayValue));
		}
	});

	function onInput(e) {
		const newValue = e.target.value;

		if (!$.get(isControlled)) {
			$.set(internalValue, newValue, true);
		}

		$$props.onDispatch($$props.nodeId, 'onChange', [newValue]);
	}

	$.user_effect(() => {
		const cmd = imperativeBus.command;

		if (cmd && cmd.nodeId === $$props.nodeId) {
			if (cmd.command === 'focus') {
				$.get(textareaRef)?.focus();
			} else if (cmd.command === 'reset') {
				if (!untrack(() => $.get(isControlled))) {
					$.set(internalValue, untrack(() => $.get(componentProps)?.defaultValue ?? ''), true);
				}
			}
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_2();
			var label = $.child(div);
			var text = $.only_child(label, true);
			var div_1 = $.sibling(label, 2);
			var node_1 = $.child(div_1);

			{
				let $0 = $.derived(() => $.get(displayValue) ?? '');
				let $1 = $.derived(() => !!$.get(componentProps).error);

				Textarea(node_1, {
					get id() {
						return $.get(componentProps).id;
					},

					get placeholder() {
						return $.get(componentProps).placeholder;
					},

					get value() {
						return $.get($0);
					},
					oninput: onInput,
					onblur: (e) => $$props.onDispatch($$props.nodeId, 'onBlur', [serializeEvent($.get(componentProps).id, e)]),
					get 'aria-invalid'() {
						return $.get($1);
					},

					get ref() {
						return $.get(textareaRef);
					},

					set ref($$value) {
						$.set(textareaRef, $$value, true);
					}
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var p = root();
					var text_1 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_1, $.get(componentProps).error));
					$.append($$anchor, p);
				};

				$.if(node_2, ($$render) => {
					if ($.get(componentProps).error) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p_1 = root_1();
					var text_2 = $.only_child(p_1, true);

					$.template_effect(() => $.set_text(text_2, $.get(componentProps).info));
					$.append($$anchor, p_1);
				};

				$.if(node_3, ($$render) => {
					if ($.get(componentProps).info) $$render(consequent_1);
				});
			}

			$.reset(div_1);
			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(label, 'for', $.get(componentProps).id);
				$.set_text(text, $.get(componentProps).title);
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(componentProps)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}