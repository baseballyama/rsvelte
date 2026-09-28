import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent } from "$lib/components/ui/card";
import ExternalLink from "@lucide/svelte/icons/external-link";

var root = $.from_html(`<div class="relative flex items-center justify-center"><svg class="h-[80px] w-[80px] -rotate-90" viewBox="0 0 80 80"><circle cx="40" cy="40" r="30" stroke="hsl(var(--muted))" stroke-width="6" fill="none"></circle><circle cx="40" cy="40" r="30" stroke="hsl(var(--primary))" stroke-width="6" fill="none" stroke-linecap="round" class="transition-all duration-300 ease-in-out"></circle></svg> <div class="absolute inset-0 flex items-center justify-center"><span class="text-base font-medium text-foreground"> </span></div></div> <div><dt class="text-sm font-medium text-foreground"> </dt> <dd class="text-sm text-muted-foreground"> </dd></div>`, 1);
var root_1 = $.from_html(`<div class="flex w-full items-center justify-center p-10"><div class="w-full"><h2 class="text-xl font-medium text-foreground">Plan overview</h2> <p class="mt-1 text-sm leading-6 text-muted-foreground"> <span class="font-medium text-foreground">starter plan</span> <a href="/" class="inline-flex items-center gap-1 text-primary hover:underline hover:underline-offset-4">View other plans <!></a></p> <dl class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"></dl></div></div>`);

export default function Stats_07($$anchor) {
	const data = [
		{
			name: "Workspaces",
			capacity: 20,
			current: 1,
			allowed: 5,
			fill: "var(--chart-1)"
		},

		{
			name: "Dashboards",
			capacity: 10,
			current: 2,
			allowed: 20,
			fill: "var(--chart-2)"
		},

		{
			name: "Chart widgets",
			capacity: 30,
			current: 15,
			allowed: 50,
			fill: "var(--chart-3)"
		},

		{
			name: "Storage",
			capacity: 50,
			current: 25,
			allowed: 100,
			fill: "var(--chart-4)"
		}
	];

	function createRadialPath(percentage) {
		const radius = 30;
		const circumference = 2 * Math.PI * radius;
		const strokeDasharray = circumference;
		const strokeDashoffset = circumference - percentage / 100 * circumference;

		return `${strokeDasharray} ${strokeDashoffset}`;
	}

	var div = root_1();
	var div_1 = $.child(div);
	var p = $.sibling($.child(div_1), 2);
	var text = $.child(p);

	text.nodeValue = 'You are currently on the  ';

	var text_1 = $.sibling(text, 2);

	text_1.nodeValue = '.  ';

	var a = $.sibling(text_1);
	var node = $.sibling($.child(a));

	ExternalLink(node, { class: 'size-4', 'aria-hidden': true });
	$.reset(a);
	$.reset(p);

	var dl = $.sibling(p, 2);

	$.each(dl, 21, () => data, (item) => item.name, ($$anchor, item) => {
		Card($$anchor, {
			class: 'p-4',
			children: ($$anchor, $$slotProps) => {
				CardContent($$anchor, {
					class: 'flex items-center space-x-4 p-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var div_2 = $.first_child(fragment_2);
						var svg = $.child(div_2);
						var circle = $.sibling($.child(svg));

						$.reset(svg);

						var div_3 = $.sibling(svg, 2);
						var span = $.child(div_3);
						var text_2 = $.only_child(span);

						$.reset(div_3);
						$.reset(div_2);

						var div_4 = $.sibling(div_2, 2);
						var dt = $.child(div_4);
						var text_3 = $.only_child(dt, true);
						var dd = $.sibling(dt, 2);
						var text_4 = $.only_child(dd);

						$.reset(div_4);

						$.template_effect(
							($0) => {
								$.set_attribute(circle, 'stroke-dasharray', $0);
								$.set_text(text_2, `${$.get(item).capacity ?? ''}%`);
								$.set_text(text_3, $.get(item).name);
								$.set_text(text_4, `${$.get(item).current ?? ''} of ${$.get(item).allowed ?? ''} used`);
							},
							[() => createRadialPath($.get(item).capacity)]
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
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}