import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/components/ui/badge";
import { Card, CardContent, CardTitle } from "$lib/components/ui/card";
import { cn } from "$lib/utils";
import TrendingDown from "@lucide/svelte/icons/trending-down";
import TrendingUp from "@lucide/svelte/icons/trending-up";

var root = $.from_html(`<!> <span class="sr-only"> </span> `, 1);
var root_1 = $.from_html(`<!> <div class="mt-1 flex items-baseline gap-2 md:block lg:flex"><div class="flex items-baseline text-2xl font-semibold text-primary"> <span class="ml-2 text-sm font-medium text-muted-foreground"> </span></div> <!></div>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-center p-10"><div class="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg bg-border md:grid-cols-3 md:divide-x md:divide-y-0"></div></div>`);

export default function Stats_02($$anchor, $$props) {
	$.push($$props, true);

	const stats = [
		{
			metric: "Active Users",
			current: "128,456",
			previous: "115,789",
			difference: "10.9%",
			trend: "up"
		},

		{
			metric: "Conversion Rate",
			current: "5.32%",
			previous: "6.18%",
			difference: "0.86%",
			trend: "down"
		},

		{
			metric: "Avg. Session Duration",
			current: "3m 42s",
			previous: "3m 15s",
			difference: "13.8%",
			trend: "up"
		}
	];

	var div = root_2();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => stats, (item) => item.metric, ($$anchor, item) => {
		Card($$anchor, {
			class: 'rounded-none border-0 py-0 shadow-sm',
			children: ($$anchor, $$slotProps) => {
				CardContent($$anchor, {
					class: 'p-4 sm:p-6',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node = $.first_child(fragment_2);

						CardTitle(node, {
							class: 'text-base font-normal',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $.get(item).metric));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var div_2 = $.sibling(node, 2);
						var div_3 = $.child(div_2);
						var text_1 = $.child(div_3);
						var span = $.sibling(text_1);
						var text_2 = $.only_child(span);

						$.reset(div_3);

						var node_1 = $.sibling(div_3, 2);

						{
							let $0 = $.derived(() => cn("inline-flex items-center px-1.5 py-0.5 ps-2.5 text-xs font-medium md:mt-2 lg:mt-0", $.get(item).trend === "up"
								? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
								: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"));

							Badge(node_1, {
								variant: 'outline',
								get class() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_2 = $.first_child(fragment_4);

									{
										var consequent = ($$anchor) => {
											TrendingUp($$anchor, {
												class: 'mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-green-500'
											});
										};

										var alternate = ($$anchor) => {
											TrendingDown($$anchor, {
												class: 'mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-red-500'
											});
										};

										$.if(node_2, ($$render) => {
											if ($.get(item).trend === "up") $$render(consequent); else $$render(alternate, -1);
										});
									}

									var span_1 = $.sibling(node_2, 2);
									var text_3 = $.only_child(span_1);
									var text_4 = $.sibling(span_1);

									$.template_effect(() => {
										$.set_text(text_3, `${$.get(item).trend === "up" ? "Increased" : "Decreased"} by`);
										$.set_text(text_4, ` ${$.get(item).difference ?? ''}`);
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						}

						$.reset(div_2);

						$.template_effect(() => {
							$.set_text(text_1, `${$.get(item).current ?? ''} `);
							$.set_text(text_2, `from ${$.get(item).previous ?? ''}`);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}