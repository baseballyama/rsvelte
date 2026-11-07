import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent } from "$lib/components/ui/card";
import { Progress } from "$lib/components/ui/progress/index.js";

var root = $.from_html(`<dt class="text-sm text-muted-foreground"> </dt> <dd class="text-2xl font-semibold text-foreground"> </dd> <!> <dd class="mt-2 flex items-center justify-between text-sm"><span class="text-primary"> </span> <span class="text-muted-foreground"> </span></dd>`, 1);
var root_1 = $.from_html(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"></dl></div>`);

export default function Stats_09($$anchor) {
	const data = [
		{
			name: "Requests",
			stat: "996",
			limit: "10,000",
			percentage: 9.96
		},

		{
			name: "Credits",
			stat: "$672",
			limit: "$1,000",
			percentage: 67.2
		},

		{
			name: "Storage",
			stat: "1.85",
			limit: "10GB",
			percentage: 18.5
		},

		{
			name: "API Calls",
			stat: "4,328",
			limit: "5,000",
			percentage: 86.56
		}
	];

	var div = root_1();
	var dl = $.child(div);

	$.each(dl, 21, () => data, (item) => item.name, ($$anchor, item) => {
		Card($$anchor, {
			class: 'py-4',
			children: ($$anchor, $$slotProps) => {
				CardContent($$anchor, {
					class: '',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var dt = $.first_child(fragment_2);
						var text = $.only_child(dt, true);
						var dd = $.sibling(dt, 2);
						var text_1 = $.only_child(dd, true);
						var node = $.sibling(dd, 2);

						Progress(node, {
							get value() {
								return $.get(item).percentage;
							},
							class: 'mt-6 h-2'
						});

						var dd_1 = $.sibling(node, 2);
						var span = $.child(dd_1);
						var text_2 = $.only_child(span);
						var span_1 = $.sibling(span, 2);
						var text_3 = $.only_child(span_1);

						$.reset(dd_1);

						$.template_effect(() => {
							$.set_text(text, $.get(item).name);
							$.set_text(text_1, $.get(item).stat);
							$.set_text(text_2, `${$.get(item).percentage ?? ''}%`);
							$.set_text(text_3, `${$.get(item).stat ?? ''} of ${$.get(item).limit ?? ''}`);
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
}