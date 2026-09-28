import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import HeadingAnchor from "./heading-anchor.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children', 'id']);
var root = $.from_html(`<h2><!></h2>`);

export default function H2($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h2 = root();

	$.attribute_effect(h2, ($0) => ({ class: $0, id: $$props.id, ...restProps }), [
		() => cn("[&+]*:[code]:text-xl mt-10 scroll-m-28 font-heading text-xl font-medium tracking-tight first:mt-0 lg:mt-12 [&+.steps]:!mt-0 [&+.steps>h3]:!mt-4 [&+h3]:!mt-6 [&+p]:!mt-4", $$props.class)
	]);

	var node = $.child(h2);

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

	$.reset(h2);
	$.append($$anchor, h2);
	$.pop();
}