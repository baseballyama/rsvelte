import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from "@lucide/svelte/icons/check";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { cn } from "$lib/utils";

var root = $.from_html(`<li class="flex items-start gap-2 text-sm text-muted-foreground"><!> </li>`);
var root_1 = $.from_html(`<div><h3 class="font-medium text-foreground"> </h3> <p class="mt-1 text-sm text-muted-foreground"> </p></div> <div class="mt-6"><span class="font-serif text-4xl font-medium"> </span> <span class="text-muted-foreground"> </span></div> <ul class="mt-6 flex-1 space-y-3"></ul> <!>`, 1);
var root_2 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Simple, Transparent Pricing</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Choose the plan that fits your needs. All plans include a 14-day free trial.</p></div> <div class="mt-12 grid gap-3 @3xl:grid-cols-2"></div></div></section>`);

export default function Pricing_one($$anchor, $$props) {
	$.push($$props, true);

	const plans = [
		{
			name: "Starter",
			description: "Perfect for individuals and small projects.",
			price: "$0",
			period: "/month",
			features: [
				"Up to 3 integrations",
				"1,000 API calls/month",
				"Community support",
				"Basic analytics"
			],
			cta: "Get Started",
			highlighted: false
		},

		{
			name: "Pro",
			description: "For growing teams that need more power.",
			price: "$29",
			period: "/month",
			features: [
				"Unlimited integrations",
				"100,000 API calls/month",
				"Priority support",
				"Advanced analytics",
				"Custom webhooks",
				"Team collaboration"
			],
			cta: "Start Free Trial",
			highlighted: true
		},

		{
			name: "Enterprise",
			description: "For organizations with advanced needs.",
			price: "Custom",
			period: "",
			features: [
				"Everything in Pro",
				"Unlimited API calls",
				"Dedicated support",
				"SLA guarantee",
				"Custom contracts",
				"On-premise option"
			],
			cta: "Contact Sales",
			highlighted: false
		}
	];

	var section = root_2();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => plans, (plan) => plan.name, ($$anchor, plan) => {
		{
			let $0 = $.derived(() => $.get(plan).highlighted ? "default" : "mixed");
			let $1 = $.derived(() => cn("relative flex flex-col p-6 last:col-span-full", $.get(plan).highlighted && "ring-primary"));

			Card($$anchor, {
				get variant() {
					return $.get($0);
				},

				get class() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
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

						Check(node, { class: 'mt-0.5 size-4 shrink-0 text-primary' });

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
							class: 'mt-8 w-full',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text();

								$.template_effect(() => $.set_text(text_5, $.get(plan).cta));
								$.append($$anchor, text_5);
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
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}