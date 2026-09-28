import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownSmall from "$lib/icons/chevron-down-small.svelte";
import { getContext } from "svelte";
import { Spinner, Text } from "$lib/index.js";

var root = $.from_html(`<span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm first-letter:capitalize"> </span> <div class="flex h-4 w-4 items-center justify-center"><div><!></div></div>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);
var root_2 = $.from_html(`<div class="flex items-center justify-between"><!> <!></div>`);

export default function Value($$anchor, $$props) {
	$.push($$props, true);

	let placeholder = $.prop($$props, 'placeholder', 3, "placeholder");
	const rootState = getContext("select");

	let spinnerSize = $.derived(() => {
		if (rootState.size === "tiny") return 14;
		if (rootState.size === "small") return 16;
		if (rootState.size === "medium") return 16;

		return 24;
	});

	// We are going to rotate the chevron icon when the select is active
	let rotate = $.derived(() => rootState.getIsActive() ? "rotate-180" : "");

	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var span = $.first_child(fragment);
			var text = $.only_child(span, true);
			var div_1 = $.sibling(span, 2);
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			ChevronDownSmall(node_1, {});
			$.reset(div_2);
			$.reset(div_1);

			$.template_effect(
				($0) => {
					$.set_text(text, $0);
					$.set_class(div_2, 1, `text-kui-light-gray-900 hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:hover:text-kui-dark-gray-1000 h-4 w-4 transform duration-300 ${$.get(rotate) ?? ''}`);
				},
				[
					() => rootState.getSelected() === "" ? placeholder() : rootState.getSelected()
				]
			);

			$.append($$anchor, fragment);
		};

		var d = $.derived(() => !rootState.getLoading());

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();
			var node_3 = $.child(div_3);

			Spinner(node_3, {
				get size() {
					return $.get(spinnerSize);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Text(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Loading...');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		var d_1 = $.derived(() => rootState.getLoading());

		$.if(node_2, ($$render) => {
			if ($.get(d_1)) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}