import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InformationFillSmall } from "$lib/icons/index.js";
import { Tooltip } from "$lib/index.js";

var root = $.from_html(`<div class="h-3.5 w-3.5"><!></div>`);
var root_1 = $.from_html(`<span class="ml-1 h-3.5 w-3.5"><!></span>`);
var root_2 = $.from_html(`<dd class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm leading-4 font-medium"> </dd>`);
var root_3 = $.from_html(`<div><dl><dt class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mb-2 flex items-center text-sm leading-3.5"><!> <!></dt> <!></dl></div>`);

export default function Description($$anchor, $$props) {
	let content = $.prop($$props, 'content', 3, undefined),
		title = $.prop($$props, 'title', 3, undefined),
		tooltip = $.prop($$props, 'tooltip', 3, undefined);

	var div = root_3();
	var dl = $.child(div);
	var dt = $.child(dl);
	var node = $.child(dt);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, title()));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (title()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span = root_1();
			var node_2 = $.child(span);

			Tooltip(node_2, {
				get text() {
					return tooltip();
				},

				children: ($$anchor, $$slotProps) => {
					var div_1 = root();
					var node_3 = $.child(div_1);

					InformationFillSmall(node_3, {});
					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if (tooltip()) $$render(consequent_1);
		});
	}

	$.reset(dt);

	var node_4 = $.sibling(dt, 2);

	{
		var consequent_2 = ($$anchor) => {
			var dd = root_2();
			var text_1 = $.only_child(dd, true);

			$.template_effect(() => $.set_text(text_1, content()));
			$.append($$anchor, dd);
		};

		$.if(node_4, ($$render) => {
			if (content()) $$render(consequent_2);
		});
	}

	$.reset(dl);
	$.reset(div);
	$.append($$anchor, div);
}