import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardFooter } from "$lib/components/ui/card";
import { cn } from "$lib/utils";

var root = $.from_html(`<dd class="flex items-start justify-between space-x-2"><span class="truncate text-sm text-muted-foreground"> </span> <span> </span></dd> <dd class="mt-1 text-3xl font-semibold text-foreground"> </dd>`, 1);
var root_1 = $.from_html(`<a class="px-6 py-3 text-sm font-medium text-primary hover:text-primary/90">View more &#8594;</a>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"></dl></div>`);

export default function Stats_05($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			name: "Monthly recurring revenue",
			value: "$34.1K",
			change: "+6.1%",
			changeType: "positive",
			href: "#"
		},

		{
			name: "Users",
			value: "500.1K",
			change: "+19.2%",
			changeType: "positive",
			href: "#"
		},

		{
			name: "User growth",
			value: "11.3%",
			change: "-1.2%",
			changeType: "negative",
			href: "#"
		}
	];

	var div = root_3();
	var dl = $.child(div);

	$.each(dl, 21, () => data, (item) => item.name, ($$anchor, item) => {
		Card($$anchor, {
			class: 'gap-0 p-0',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node = $.first_child(fragment_1);

				CardContent(node, {
					class: 'p-6',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var dd = $.first_child(fragment_2);
						var span = $.child(dd);
						var text = $.only_child(span, true);
						var span_1 = $.sibling(span, 2);
						var text_1 = $.only_child(span_1, true);

						$.reset(dd);

						var dd_1 = $.sibling(dd, 2);
						var text_2 = $.only_child(dd_1, true);

						$.template_effect(
							($0) => {
								$.set_text(text, $.get(item).name);
								$.set_class(span_1, 1, $0);
								$.set_text(text_1, $.get(item).change);
								$.set_text(text_2, $.get(item).value);
							},
							[
								() => $.clsx(cn("text-sm font-medium", $.get(item).changeType === "positive"
									? "text-emerald-700 dark:text-emerald-500"
									: "text-red-700 dark:text-red-500"))
							]
						);

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				CardFooter(node_1, {
					class: 'flex justify-end border-t border-border p-0!',
					children: ($$anchor, $$slotProps) => {
						var a = root_1();

						$.template_effect(() => $.set_attribute(a, 'href', $.get(item).href));
						$.append($$anchor, a);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(dl);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}