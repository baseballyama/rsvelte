import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { cn } from "$lib/utils";

var root = $.from_html(`<span class="text-sm text-muted-foreground"> </span>`);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-2 @2xl:flex-row @2xl:items-center @2xl:gap-6"><div class="shrink-0 @2xl:w-44"><h3 class="font-medium text-foreground"> </h3> <p class="text-sm text-muted-foreground"> </p></div> <div class="@2xl:border-l @2xl:pl-6"><p class="text-sm text-muted-foreground"> </p></div></div> <div class="flex flex-col gap-4 @2xl:flex-row @2xl:items-center"><div class="@2xl:text-right"><span class="font-serif text-2xl font-medium"> </span> <!></div> <!></div>`, 1);
var root_3 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-3xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Usage-Based Pricing</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Pay only for what you use. All plans include the same features.</p></div> <div class="mt-12 space-y-3"></div> <div class="mt-8 rounded-xl bg-muted p-6 text-center"><p class="font-medium text-foreground">Need more requests?</p> <p class="mt-1 text-sm text-muted-foreground">Additional requests are billed at $0.001 per request after your plan limit.</p></div></div></section>`);

export default function Pricing_two($$anchor, $$props) {
	$.push($$props, true);

	const tiers = [
		{
			name: "Hobby",
			description: "For personal projects",
			price: "$0",
			period: "/month",
			limit: "1,000 requests/month"
		},

		{
			name: "Pro",
			description: "For professional use",
			price: "$20",
			period: "/month",
			limit: "50,000 requests/month",
			highlighted: true
		},

		{
			name: "Scale",
			description: "For high-volume apps",
			price: "$100",
			period: "/month",
			limit: "500,000 requests/month"
		},

		{
			name: "Enterprise",
			description: "For large organizations",
			price: "Custom",
			period: "",
			limit: "Unlimited requests"
		}
	];

	var section = root_3();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => tiers, (tier) => tier.name, ($$anchor, tier) => {
		{
			let $0 = $.derived(() => cn("flex flex-col gap-4 p-4 @2xl:flex-row @2xl:items-center @2xl:justify-between", $.get(tier).highlighted && "ring-primary"));

			Card($$anchor, {
				variant: 'outline',
				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_2();
					var div_2 = $.first_child(fragment_1);
					var div_3 = $.child(div_2);
					var h3 = $.child(div_3);
					var text = $.only_child(h3, true);
					var p = $.sibling(h3, 2);
					var text_1 = $.only_child(p, true);

					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var p_1 = $.child(div_4);
					var text_2 = $.only_child(p_1, true);

					$.reset(div_4);
					$.reset(div_2);

					var div_5 = $.sibling(div_2, 2);
					var div_6 = $.child(div_5);
					var span = $.child(div_6);
					var text_3 = $.only_child(span, true);
					var node = $.sibling(span, 2);

					{
						var consequent = ($$anchor) => {
							var span_1 = root();
							var text_4 = $.only_child(span_1, true);

							$.template_effect(() => $.set_text(text_4, $.get(tier).period));
							$.append($$anchor, span_1);
						};

						$.if(node, ($$render) => {
							if ($.get(tier).period) $$render(consequent);
						});
					}

					$.reset(div_6);

					var node_1 = $.sibling(div_6, 2);

					{
						let $0 = $.derived(() => $.get(tier).highlighted ? "default" : "outline");

						Button(node_1, {
							href: '#link',
							get variant() {
								return $.get($0);
							},
							size: 'sm',
							class: 'gap-1',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_2 = root_1();
								var text_5 = $.first_child(fragment_2);
								var node_2 = $.sibling(text_5);

								ArrowRight(node_2, { class: 'size-3.5' });
								$.template_effect(() => $.set_text(text_5, `${$.get(tier).price === "Custom" ? "Contact Us" : "Get Started"} `));
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_5);

					$.template_effect(() => {
						$.set_text(text, $.get(tier).name);
						$.set_text(text_1, $.get(tier).description);
						$.set_text(text_2, $.get(tier).limit);
						$.set_text(text_3, $.get(tier).price);
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