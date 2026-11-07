import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'step']);
var root = $.from_html(`<button> </button>`);

export default function Stepper_item($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	var button = root();

	$.attribute_effect(button, ($0) => ({ class: $0, ...props }), [() => cn("bg-blue-500", $$props.class)]);

	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $$props.step));
	$.append($$anchor, button);
	$.pop();
}