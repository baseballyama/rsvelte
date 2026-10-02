import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";

var root = $.from_html(`<dt class="text-sm font-medium text-muted-foreground"> </dt> <dd class="mt-2 flex items-baseline space-x-2.5"><span class="text-3xl font-semibold text-foreground"> </span> <span> </span></dd>`, 1);
var root_1 = $.from_html(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"></dl></div>`);

export default function Stats_03($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			name: "Unique visitors",
			stat: "10,450",
			change: "-12.5%",
			changeType: "negative"
		},

		{
			name: "Bounce rate",
			stat: "56.1%",
			change: "+1.8%",
			changeType: "positive"
		},

		{
			name: "Visit duration",
			stat: "5.2min",
			change: "+19.7%",
			changeType: "positive"
		},

		{
			name: "Conversion rate",
			stat: "3.2%",
			change: "-2.4%",
			changeType: "negative"
		}
	];

	var div = root_1();
	var dl = $.child(div);

	$.each(dl, 21, () => data, (item) => item.name, ($$anchor, item) => {
		Card($$anchor, {
			class: 'p-6 py-4',
			children: ($$anchor, $$slotProps) => {
				CardContent($$anchor, {
					class: 'p-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var dt = $.first_child(fragment_2);
						var text = $.only_child(dt, true);
						var dd = $.sibling(dt, 2);
						var span = $.child(dd);
						var text_1 = $.only_child(span, true);
						var span_1 = $.sibling(span, 2);
						var text_2 = $.only_child(span_1, true);

						$.reset(dd);

						$.template_effect(
							($0) => {
								$.set_text(text, $.get(item).name);
								$.set_text(text_1, $.get(item).stat);
								$.set_class(span_1, 1, $0);
								$.set_text(text_2, $.get(item).change);
							},
							[
								() => $.clsx(cn(
									$.get(item).changeType === "positive"
										? "text-green-800 dark:text-green-400"
										: "text-red-800 dark:text-red-400",
									"text-sm font-medium"
								))
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