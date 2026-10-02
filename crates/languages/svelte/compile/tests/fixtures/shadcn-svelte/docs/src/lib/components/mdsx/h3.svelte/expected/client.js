import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import HeadingAnchor from "./heading-anchor.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children', 'id']);
var root = $.from_html(`<h3><!></h3>`);

export default function H3($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h3 = root();

	$.attribute_effect(h3, ($0) => ({ class: $0, id: $$props.id, ...restProps }), [
		() => cn("mt-12 scroll-m-28 font-heading text-lg font-medium tracking-tight [&+p]:!mt-4 *:[code]:text-xl", $$props.class)
	]);

	var node = $.child(h3);

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

	$.reset(h3);
	$.append($$anchor, h3);
	$.pop();
}