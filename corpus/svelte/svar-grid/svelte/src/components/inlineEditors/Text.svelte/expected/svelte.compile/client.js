import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { clickOutside } from "@svar-ui/lib-dom";

var root = $.from_html(`<input class="wx-text svelte-185hkbp"/>`);

export default function Text($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy($$props.editor.value || ""));

	let $$d = $.derived(() => $$props.editor?.config || {}),
		type = $.derived(() => $.fallback($.get($$d).type, "text"));

	let node = $.state(void 0);

	onMount(() => $.get(node).focus());

	function updateValue() {
		$.set(value, $.get(node).value, true);
		$$props.onapply($.get(node).value);
	}

	function closeAndSave({ key }) {
		if (key === "Enter") $$props.onsave();
	}

	var input = root();

	$.remove_input_defaults(input);
	$.action(input, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => $$props.onsave(true));
	$.bind_this(input, ($$value) => $.set(node, $$value), () => $.get(node));

	$.template_effect(() => {
		$.set_attribute(input, 'type', $.get(type));
		$.set_value(input, $.get(value));
	});

	$.delegated('input', input, updateValue);
	$.delegated('keydown', input, closeAndSave);
	$.append($$anchor, input);
	$.pop();
}

$.delegate(['input', 'keydown']);