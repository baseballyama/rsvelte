import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance } from '$app/forms';
import { form_action } from './form_action';

var root = $.from_html(`<form method="POST"><!> <button type="submit"> </button></form>`);

export default function FormButton($$anchor, $$props) {
	$.push($$props, true);

	let thinking = $.state(false);
	var form = root();
	var node = $.child(form);

	$.snippet(node, () => $$props.children ?? $.noop);

	var button = $.sibling(node, 2);
	var text_1 = $.only_child(button, true);

	$.reset(form);

	$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), () => form_action(
		{},
		() => {
			$.set(thinking, true);
		},
		() => {
			$.set(thinking, false);
		}
	));

	$.template_effect(() => {
		$.set_attribute(form, 'action', $$props.action_path);
		button.disabled = $.get(thinking);
		$.set_text(text_1, $.get(thinking) ? $$props.thinking_text : $$props.text);
	});

	$.append($$anchor, form);
	$.pop();
}