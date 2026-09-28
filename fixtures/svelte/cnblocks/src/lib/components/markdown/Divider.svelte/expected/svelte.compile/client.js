import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<hr/>`);

export default function Divider($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var hr = root();

	$.attribute_effect(hr, ($0) => ({ ...restProps, class: $0 }), [() => cn("my-12 border-t border-border", className())]);
	$.append($$anchor, hr);
	$.pop();
}