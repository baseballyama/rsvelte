import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";
import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
import Check from "@lucide/svelte/icons/check";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Eye from "@lucide/svelte/icons/eye";

var root = $.from_html(`<dt class="text-sm font-medium text-muted-foreground"> </dt> <dd class="text-3xl font-semibold text-foreground"> </dd> <div class="group relative mt-6 flex items-center space-x-4 rounded-md bg-muted/60 p-2 hover:bg-muted"><div class="flex w-full items-center justify-between truncate"><div class="flex items-center space-x-3"><span><!></span> <dd><p class="text-sm text-muted-foreground"><a class="focus:outline-none"><span class="absolute inset-0"></span> </a></p> <p> </p></dd></div> <!></div></div>`, 1);
var root_1 = $.from_html(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"></dl></div>`);

export default function Stats_06($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			name: "Europe",
			stat: "$10,023",
			goalsAchieved: 3,
			status: "observe",
			href: "#"
		},

		{
			name: "North America",
			stat: "$14,092",
			goalsAchieved: 5,
			status: "within",
			href: "#"
		},

		{
			name: "Asia",
			stat: "$113,232",
			goalsAchieved: 1,
			status: "critical",
			href: "#"
		}
	];

	var div = root_1();
	var dl = $.child(div);

	$.each(dl, 21, () => data, (item) => item.name, ($$anchor, item) => {
		Card($$anchor, {
			class: 'relative p-6',
			children: ($$anchor, $$slotProps) => {
				CardContent($$anchor, {
					class: 'p-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var dt = $.first_child(fragment_2);
						var text = $.only_child(dt, true);
						var dd = $.sibling(dt, 2);
						var text_1 = $.only_child(dd, true);
						var div_1 = $.sibling(dd, 2);
						var div_2 = $.child(div_1);
						var div_3 = $.child(div_2);
						var span = $.child(div_3);
						var node = $.child(span);

						{
							var consequent = ($$anchor) => {
								Check($$anchor, { class: 'size-4 shrink-0', 'aria-hidden': true });
							};

							var consequent_1 = ($$anchor) => {
								Eye($$anchor, { class: 'size-4 shrink-0', 'aria-hidden': true });
							};

							var alternate = ($$anchor) => {
								AlertTriangle($$anchor, { class: 'size-4 shrink-0', 'aria-hidden': true });
							};

							$.if(node, ($$render) => {
								if ($.get(item).status === "within") $$render(consequent); else if ($.get(item).status === "observe") $$render(consequent_1, 1); else $$render(alternate, -1);
							});
						}

						$.reset(span);

						var dd_1 = $.sibling(span, 2);
						var p = $.child(dd_1);
						var a = $.child(p);
						var span_1 = $.child(a);

						$.set_attribute(span_1, 'aria-hidden', true);

						var text_2 = $.sibling(span_1);

						$.reset(a);
						$.reset(p);

						var p_1 = $.sibling(p, 2);
						var text_3 = $.only_child(p_1, true);

						$.reset(dd_1);
						$.reset(div_3);

						var node_1 = $.sibling(div_3, 2);

						ChevronRight(node_1, {
							class: 'size-5 shrink-0 text-muted-foreground/60 group-hover:text-muted-foreground',
							'aria-hidden': true
						});

						$.reset(div_2);
						$.reset(div_1);

						$.template_effect(
							($0, $1) => {
								$.set_text(text, $.get(item).name);
								$.set_text(text_1, $.get(item).stat);
								$.set_class(span, 1, $0);
								$.set_attribute(a, 'href', $.get(item).href);
								$.set_text(text_2, ` ${$.get(item).goalsAchieved ?? ''}/5 goals`);
								$.set_class(p_1, 1, $1);
								$.set_text(text_3, $.get(item).status);
							},
							[
								() => $.clsx(cn("flex h-9 w-9 shrink-0 items-center justify-center rounded", $.get(item).status === "within"
									? "bg-emerald-500 text-white"
									: $.get(item).status === "observe" ? "bg-yellow-500 text-white" : "bg-red-500 text-white")),

								() => $.clsx(cn("text-sm font-medium", $.get(item).status === "within"
									? "text-emerald-800 dark:text-emerald-500"
									: $.get(item).status === "observe"
										? "text-yellow-800 dark:text-yellow-500"
										: "text-red-800 dark:text-red-500"))
							]
						);

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