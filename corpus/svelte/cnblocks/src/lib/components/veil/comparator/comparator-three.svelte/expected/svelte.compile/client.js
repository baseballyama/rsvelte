import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from "@lucide/svelte/icons/check";
import Minus from "@lucide/svelte/icons/minus";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";

var root = $.from_html(`<span class="text-muted-foreground"> </span>`);
var root_1 = $.from_html(`<span class="font-medium text-foreground"> </span>`);
var root_2 = $.from_html(`<div class="flex items-center justify-between border-b py-3 text-sm last:border-b-0"><span class="text-muted-foreground"> </span> <!></div>`);
var root_3 = $.from_html(`<div class="flex flex-col gap-6 @lg:flex-row @lg:items-start @lg:justify-between"><div class="@lg:max-w-xs"><h3 class="font-medium text-foreground"> </h3> <p class="mt-1 text-sm text-muted-foreground"> </p> <div class="mt-4"><span class="font-serif text-3xl font-medium"> </span> <!></div> <!></div> <div class="w-full shrink-0 @lg:w-64"></div></div>`);
var root_4 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Choose Your Plan</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Start free and scale as you grow.</p></div> <div class="mt-12 space-y-4"></div></div></section>`);

export default function Comparator_three($$anchor) {
	const plans = [
		{
			name: "Starter",
			price: "$0",
			period: "/month",
			description: "For individuals and small projects",
			cta: "Get Started",
			features: {
				integrations: "3",
				apiCalls: "1,000/mo",
				support: "Community",
				analytics: false,
				webhooks: false,
				sso: false
			}
		},

		{
			name: "Pro",
			price: "$29",
			period: "/month",
			description: "For growing teams",
			cta: "Start Free Trial",
			highlighted: true,
			features: {
				integrations: "Unlimited",
				apiCalls: "100,000/mo",
				support: "Priority",
				analytics: true,
				webhooks: true,
				sso: false
			}
		},

		{
			name: "Enterprise",
			price: "Custom",
			period: "",
			description: "For large organizations",
			cta: "Contact Sales",
			features: {
				integrations: "Unlimited",
				apiCalls: "Unlimited",
				support: "Dedicated",
				analytics: true,
				webhooks: true,
				sso: true
			}
		}
	];

	const featureLabels = {
		integrations: "Integrations",
		apiCalls: "API Calls",
		support: "Support",
		analytics: "Analytics",
		webhooks: "Custom Webhooks",
		sso: "SSO / SAML"
	};

	const featureKeys = [
		"integrations",
		"apiCalls",
		"support",
		"analytics",
		"webhooks",
		"sso"
	];

	var section = root_4();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => plans, (plan) => plan.name, ($$anchor, plan) => {
		{
			let $0 = $.derived(() => $.get(plan).highlighted ? "default" : "mixed");
			let $1 = $.derived(() => `p-6 ${$.get(plan).highlighted ? "ring-primary" : ""}`);

			Card($$anchor, {
				get variant() {
					return $.get($0);
				},

				get class() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					var div_2 = root_3();
					var div_3 = $.child(div_2);
					var h3 = $.child(div_3);
					var text = $.only_child(h3, true);
					var p = $.sibling(h3, 2);
					var text_1 = $.only_child(p, true);
					var div_4 = $.sibling(p, 2);
					var span = $.child(div_4);
					var text_2 = $.only_child(span, true);
					var node = $.sibling(span, 2);

					{
						var consequent = ($$anchor) => {
							var span_1 = root();
							var text_3 = $.only_child(span_1, true);

							$.template_effect(() => $.set_text(text_3, $.get(plan).period));
							$.append($$anchor, span_1);
						};

						$.if(node, ($$render) => {
							if ($.get(plan).period) $$render(consequent);
						});
					}

					$.reset(div_4);

					var node_1 = $.sibling(div_4, 2);

					{
						let $0 = $.derived(() => $.get(plan).highlighted ? "default" : "outline");

						Button(node_1, {
							href: '#link',
							get variant() {
								return $.get($0);
							},
							size: 'sm',
							class: 'mt-4',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text();

								$.template_effect(() => $.set_text(text_4, $.get(plan).cta));
								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_3);

					var div_5 = $.sibling(div_3, 2);

					$.each(div_5, 20, () => featureKeys, (featureKey) => featureKey, ($$anchor, featureKey) => {
						const value = $.derived(() => $.get(plan).features[featureKey]);
						var div_6 = root_2();
						var span_2 = $.child(div_6);
						var text_5 = $.only_child(span_2, true);
						var node_2 = $.sibling(span_2, 2);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								{
									var consequent_1 = ($$anchor) => {
										Check($$anchor, { class: 'size-4 text-primary' });
									};

									var alternate = ($$anchor) => {
										Minus($$anchor, { class: 'size-4 text-muted-foreground/50' });
									};

									$.if(node_3, ($$render) => {
										if ($.get(value)) $$render(consequent_1); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_2);
							};

							var alternate_1 = ($$anchor) => {
								var span_3 = root_1();
								var text_6 = $.only_child(span_3, true);

								$.template_effect(() => $.set_text(text_6, $.get(value)));
								$.append($$anchor, span_3);
							};

							$.if(node_2, ($$render) => {
								if (typeof $.get(value) === "boolean") $$render(consequent_2); else $$render(alternate_1, -1);
							});
						}

						$.reset(div_6);
						$.template_effect(() => $.set_text(text_5, featureLabels[featureKey]));
						$.append($$anchor, div_6);
					});

					$.reset(div_5);
					$.reset(div_2);

					$.template_effect(() => {
						$.set_text(text, $.get(plan).name);
						$.set_text(text_1, $.get(plan).description);
						$.set_text(text_2, $.get(plan).price);
					});

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}