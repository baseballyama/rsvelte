import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/components/ui/badge";
import { Card, CardContent } from "$lib/components/ui/card";

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<li class="flex items-center gap-2 text-xs"><span aria-hidden="true"></span> <span class="text-foreground"> </span> <span class="text-muted-foreground"> </span></li>`);
var root_2 = $.from_html(`<div><div class="flex items-center gap-2"><h3 class="text-sm font-bold text-foreground">Usage</h3> <!></div> <p class="mt-2 flex items-baseline gap-2"><span class="text-xl text-foreground">$860</span> <span class="text-sm text-muted-foreground">this month</span></p> <div class="mt-4"><p class="text-sm font-medium text-foreground">Resource breakdown</p> <div class="mt-2 flex items-center gap-0.5"></div></div> <ul role="list" class="mt-5 space-y-2"></ul></div> <p class="mt-6 text-xs text-muted-foreground"> <a href="/" class="text-emerald-600 hover:underline dark:text-emerald-400">resource settings.</a></p>`, 1);

export default function Stats_14($$anchor) {
	const data = [
		{
			label: "Compute",
			amount: 450,
			percentage: 52.3,
			color: "emerald"
		},

		{
			label: "Storage",
			amount: 285,
			percentage: 33.1,
			color: "amber"
		},

		{
			label: "Bandwidth",
			amount: 125,
			percentage: 14.6,
			color: "rose"
		}
	];

	const colorClasses = {
		emerald: "bg-emerald-500 dark:bg-emerald-400",
		amber: "bg-amber-500 dark:bg-amber-400",
		rose: "bg-rose-500 dark:bg-rose-400"
	};

	Card($$anchor, {
		class: 'w-full max-w-sm shadow-none',
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				class: 'flex flex-col justify-between pt-0',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var div = $.first_child(fragment_2);
					var div_1 = $.child(div);
					var node = $.sibling($.child(div_1), 2);

					Badge(node, {
						variant: 'secondary',
						class: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/30 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('+12.5%');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.reset(div_1);

					var div_2 = $.sibling(div_1, 4);
					var div_3 = $.sibling($.child(div_2), 2);

					$.each(div_3, 21, () => data, $.index, ($$anchor, item) => {
						var div_4 = root();

						$.template_effect(() => {
							$.set_class(div_4, 1, `${colorClasses[$.get(item).color] ?? ''} h-1.5 rounded-xs`);
							$.set_style(div_4, `width: ${$.get(item).percentage ?? ''}%`);
						});

						$.append($$anchor, div_4);
					});

					$.reset(div_3);
					$.reset(div_2);

					var ul = $.sibling(div_2, 2);

					$.each(ul, 21, () => data, $.index, ($$anchor, item) => {
						var li = root_1();
						var span = $.child(li);
						var span_1 = $.sibling(span, 2);
						var text_1 = $.only_child(span_1, true);
						var span_2 = $.sibling(span_1, 2);
						var text_2 = $.only_child(span_2);

						$.reset(li);

						$.template_effect(() => {
							$.set_class(span, 1, `${colorClasses[$.get(item).color] ?? ''} size-2.5 rounded-xs`);
							$.set_text(text_1, $.get(item).label);
							$.set_text(text_2, `($${$.get(item).amount ?? ''} / ${$.get(item).percentage ?? ''}%)`);
						});

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div);

					var p = $.sibling(div, 2);
					var text_3 = $.child(p);

					text_3.nodeValue = 'Configure limits in  ';
					$.next();
					$.reset(p);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}