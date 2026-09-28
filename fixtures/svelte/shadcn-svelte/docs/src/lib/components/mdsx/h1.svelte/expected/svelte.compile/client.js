import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import HeadingAnchor from "./heading-anchor.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children', 'id']);
var root = $.from_html(`<h1><!></h1>`);

export default function H1($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h1 = root();

	$.attribute_effect(h1, ($0) => ({ class: $0, id: $$props.id, ...restProps }), [
		() => cn("mt-2 scroll-m-28 font-heading text-3xl font-bold tracking-tight", $$props.class)
	]);

	var node = $.child(h1);

	{
		let $0 = $.derived(() => $$props.id ?? undefined);

		HeadingAnchor(node, {
			get id() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.snippet(node_1, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(h1);
	$.append($$anchor, h1);
	$.pop();
}