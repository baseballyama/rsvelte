import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SearchIcon from "@lucide/svelte/icons/search";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<form><div class="relative"><!> <!> <!></div></form>`);

export default function Search_form($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var form = root();

	$.attribute_effect(form, () => ({ ...restProps }));

	var div = $.child(form);
	var node = $.child(div);

	Label(node, {
		for: 'search',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Search');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Sidebar.Input, ($$anchor, Sidebar_Input) => {
		Sidebar_Input($$anchor, {
			id: 'search',
			placeholder: 'Type to search...',
			class: 'h-8 ps-7'
		});
	});

	var node_2 = $.sibling(node_1, 2);

	SearchIcon(node_2, {
		class: 'pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 opacity-50 select-none'
	});

	$.reset(div);
	$.reset(form);
	$.bind_this(form, ($$value) => ref($$value), () => ref());
	$.append($$anchor, form);
	$.pop();
}