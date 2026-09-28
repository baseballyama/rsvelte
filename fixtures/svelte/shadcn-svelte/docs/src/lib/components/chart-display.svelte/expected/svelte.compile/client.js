import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import ChartToolbar from "./chart-toolbar.svelte";

var root = $.from_html(`<div><!> <div class="relative z-10 [&amp;>div]:rounded-none [&amp;>div]:border-none [&amp;>div]:shadow-none"><!></div></div>`);

export default function Chart_display($$anchor, $$props) {
	$.push($$props, true);

	const chart = $.derived(() => $$props.chartData.find((c) => c.name === $$props.name));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ChartToolbar(node_1, {
				get chart() {
					return $.get(chart);
				},
				class: 'relative z-20 flex justify-end border-b bg-card px-3 py-2.5 text-card-foreground',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_1, 2);
			var node_3 = $.child(div_1);

			$.snippet(node_3, () => $$props.children ?? $.noop);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(($0) => $.set_class(div, 1, $0), [
				() => $.clsx(cn("themes-wrapper group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 ease-in-out hover:z-30", $$props.class))
			]);

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(chart)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}