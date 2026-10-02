import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Check from "@lucide/svelte/icons/check";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { cn } from "$lib/utils";

var root = $.from_html(`<li class="flex items-center gap-2 text-sm text-muted-foreground"><!> </li>`);
var root_1 = $.from_html(`Get Started <!>`, 1);
var root_2 = $.from_html(`<div class="mb-6"><h3 class="font-medium text-foreground"> </h3> <p class="mt-1 text-sm text-muted-foreground"> </p></div> <div><span class="font-serif text-5xl font-medium"> </span> <span class="text-muted-foreground"> </span></div> <ul class="mt-6 space-y-3"></ul> <!>`, 1);
var root_3 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">One Plan, Simple Pricing</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Everything you need to build powerful integrations. Choose your billing cycle.</p></div> <div class="mt-12 grid gap-6 @xl:grid-cols-2 @xl:gap-3"></div> <p class="mt-8 text-center text-sm text-muted-foreground">All plans include a 14-day free trial. No credit card required.</p></div></section>`);

export default function Pricing_three($$anchor, $$props) {
	$.push($$props, true);

	const plans = [
		{
			name: "Monthly",
			price: "$29",
			period: "/month",
			description: "Flexible month-to-month billing",
			features: [
				"All features included",
				"Cancel anytime",
				"No long-term commitment"
			]
		},

		{
			name: "Annual",
			price: "$19",
			period: "/month",
			description: "Save 35% with annual billing",
			features: [
				"All features included",
				"2 months free",
				"Priority onboarding"
			],
			highlighted: true,
			badge: "Best Value"
		}
	];

	var section = root_3();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => plans, (plan) => plan.name, ($$anchor, plan) => {
		{
			let $0 = $.derived(() => $.get(plan).highlighted ? "default" : "mixed");
			let $1 = $.derived(() => cn("relative p-6", $.get(plan).highlighted && "ring-primary"));

			Card($$anchor, {
				get variant() {
					return $.get($0);
				},

				get class() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_2();
					var div_2 = $.first_child(fragment_1);
					var h3 = $.child(div_2);
					var text = $.only_child(h3, true);
					var p = $.sibling(h3, 2);
					var text_1 = $.only_child(p, true);

					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var span = $.child(div_3);
					var text_2 = $.only_child(span, true);
					var span_1 = $.sibling(span, 2);
					var text_3 = $.only_child(span_1, true);

					$.reset(div_3);

					var ul = $.sibling(div_3, 2);

					$.each(ul, 20, () => $.get(plan).features, (feature) => feature, ($$anchor, feature) => {
						var li = root();
						var node = $.child(li);

						Check(node, { class: 'size-4 text-primary' });

						var text_4 = $.sibling(node);

						$.reset(li);
						$.template_effect(() => $.set_text(text_4, ` ${feature ?? ''}`));
						$.append($$anchor, li);
					});

					$.reset(ul);

					var node_1 = $.sibling(ul, 2);

					{
						let $0 = $.derived(() => $.get(plan).highlighted ? "default" : "outline");

						Button(node_1, {
							href: '#link',
							get variant() {
								return $.get($0);
							},
							class: 'mt-8 w-full gap-2',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_2 = root_1();
								var node_2 = $.sibling($.first_child(fragment_2));

								ArrowRight(node_2, { class: 'size-4' });
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					}

					$.template_effect(() => {
						$.set_text(text, $.get(plan).name);
						$.set_text(text_1, $.get(plan).description);
						$.set_text(text_2, $.get(plan).price);
						$.set_text(text_3, $.get(plan).period);
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}