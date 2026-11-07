import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/components/ui/badge";
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";
import TrendingDown from "@lucide/svelte/icons/trending-down";
import TrendingUp from "@lucide/svelte/icons/trending-up";

var root = $.from_html(`<!> <span class="sr-only"> </span> `, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between"><dt class="text-sm font-medium text-muted-foreground"> </dt> <!></div> <dd class="mt-2 text-3xl font-semibold text-foreground"> </dd>`, 1);
var root_2 = $.from_html(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"></dl></div>`);

export default function Stats_04($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			name: "Daily active users",
			stat: "3,450",
			change: "+12.1%",
			changeType: "positive"
		},

		{
			name: "Weekly sessions",
			stat: "1,342",
			change: "-9.8%",
			changeType: "negative"
		},

		{
			name: "Duration",
			stat: "5.2min",
			change: "+7.7%",
			changeType: "positive"
		}
	];

	var div = root_2();
	var dl = $.child(div);

	$.each(dl, 21, () => data, (item) => item.name, ($$anchor, item) => {
		Card($$anchor, {
			class: 'w-full p-6 py-4',
			children: ($$anchor, $$slotProps) => {
				CardContent($$anchor, {
					class: 'p-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var div_1 = $.first_child(fragment_2);
						var dt = $.child(div_1);
						var text = $.only_child(dt, true);
						var node = $.sibling(dt, 2);

						{
							let $0 = $.derived(() => cn("inline-flex items-center px-1.5 py-0.5 ps-2.5 text-xs font-medium", $.get(item).changeType === "positive"
								? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
								: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"));

							Badge(node, {
								variant: 'outline',
								get class() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_1 = $.first_child(fragment_3);

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

										$.if(node_1, ($$render) => {
											if ($.get(item).changeType === "positive") $$render(consequent); else $$render(alternate, -1);
										});
									}

									var span = $.sibling(node_1, 2);
									var text_1 = $.only_child(span);
									var text_2 = $.sibling(span);

									$.template_effect(() => {
										$.set_text(text_1, `${$.get(item).changeType === "positive" ? "Increased" : "Decreased"} by`);
										$.set_text(text_2, ` ${$.get(item).change ?? ''}`);
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						}

						$.reset(div_1);

						var dd = $.sibling(div_1, 2);
						var text_3 = $.only_child(dd, true);

						$.template_effect(() => {
							$.set_text(text, $.get(item).name);
							$.set_text(text_3, $.get(item).stat);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.reset(dl);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}