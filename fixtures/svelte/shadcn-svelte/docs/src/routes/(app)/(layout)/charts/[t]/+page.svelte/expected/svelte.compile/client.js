import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartDisplay from "$lib/components/chart-display.svelte";
import { cn } from "$lib/utils.js";
import { charts } from "../charts.js";

var root = $.from_html(`<div class="hidden aspect-square w-full rounded-lg border border-dashed xl:block"></div>`);
var root_1 = $.from_html(`<div class="grid flex-1 gap-12 lg:gap-24"><h2 class="sr-only"> </h2> <div class="grid flex-1 scroll-mt-20 items-stretch gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10"></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const chartList = $.derived(() => charts[$$props.data.type]);
	var div = root_1();
	var h2 = $.child(div);
	var text = $.only_child(h2);
	var div_1 = $.sibling(h2, 2);

	$.each(div_1, 20, () => ({ length: 12 }), $.index, ($$anchor, _, index) => {
		const chart = $.derived(() => $.get(chartList)[index]);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				{
					let $0 = $.derived(() => cn($.get(chart).fullWidth && "md:col-span-2 lg:col-span-3"));

					ChartDisplay($$anchor, {
						get name() {
							return $.get(chart).id;
						},

						get class() {
							return $.get($0);
						},

						get chartData() {
							return $$props.data.charts;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_1 = $.first_child(fragment_2);

							$.component(node_1, () => $.get(chart).component, ($$anchor, chart_component) => {
								chart_component($$anchor, {});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				}
			};

			var alternate = ($$anchor) => {
				var div_2 = root();

				$.append($$anchor, div_2);
			};

			$.if(node, ($$render) => {
				if ($.get(chart)) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} Charts`), [
		() => $$props.data.type.charAt(0).toUpperCase() + $$props.data.type.slice(1)
	]);

	$.append($$anchor, div);
	$.pop();
}