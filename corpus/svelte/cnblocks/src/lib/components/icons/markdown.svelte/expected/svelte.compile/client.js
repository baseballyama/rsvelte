import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_svg(`<svg><path fill="none" stroke="currentColor" stroke-width="10" d="M15 5h178a10 10 0 0 1 10 10v98a10 10 0 0 1-10 10H15a10 10 0 0 1-10-10V15A10 10 0 0 1 15 5z"></path><path fill="currentColor" d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39H30zm125 0-30-33h20V30h20v35h20l-30 33z"></path></svg>`);

export default function Markdown($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(
		svg,
		($0) => ({
			viewBox: '0 0 208 128',
			'xml:space': 'preserve',
			class: $0,
			...rest
		}),
		[() => cn("size-4", $$props.class)]
	);

	$.append($$anchor, svg);
	$.pop();
}