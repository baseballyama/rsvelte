import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<option><!></option>`);

export default function Native_select_option($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var option = root();

	$.attribute_effect(option, ($0) => ({ 'data-slot': 'native-select-option', class: $0, ...restProps }), [() => cn("bg-[Canvas] text-[CanvasText]", $$props.class)]);

	$.customizable_select(option, () => {
		var anchor = $.child(option);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.append(anchor, fragment);
	});

	$.bind_this(option, ($$value) => ref($$value), () => ref());
	$.append($$anchor, option);
	$.pop();
}