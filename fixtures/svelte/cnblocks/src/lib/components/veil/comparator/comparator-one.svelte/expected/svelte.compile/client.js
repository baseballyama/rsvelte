import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from "@lucide/svelte/icons/check";
import Minus from "@lucide/svelte/icons/minus";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";

var root = $.from_html(`<div><p class="font-medium text-foreground"> </p> <p class="mt-1"><span class="font-serif text-2xl font-medium"> </span> <span class="text-sm text-muted-foreground"> </span></p></div>`);
var root_1 = $.from_html(`<span class="text-foreground"> </span>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<div class="grid grid-cols-4 border-b last:border-b-0"><div class="p-4 text-sm text-muted-foreground"> </div> <!></div>`);
var root_4 = $.from_html(`<div class="grid grid-cols-4 border-b"><div class="p-4"></div> <!></div> <!> <div class="grid grid-cols-4 border-t"><div class="p-4"></div> <!></div>`, 1);
var root_5 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-3xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Compare Plans</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Find the perfect plan for your team's needs.</p></div> <!></div></section>`);

export default function Comparator_one($$anchor) {
	const planKeys = ["basic", "pro", "team"];

	const plans = [
		{
			name: "Basic",
			price: "$9",
			period: "/month",
			cta: "Get Started",
			highlighted: false
		},

		{
			name: "Pro",
			price: "$29",
			period: "/month",
			cta: "Start Free Trial",
			highlighted: true
		},

		{
			name: "Team",
			price: "$79",
			period: "/month",
			cta: "Start Free Trial",
			highlighted: false
		}
	];

	const features = [
		{
			name: "Integrations",
			basic: "5",
			pro: "Unlimited",
			team: "Unlimited"
		},

		{
			name: "API Calls",
			basic: "10K/mo",
			pro: "100K/mo",
			team: "1M/mo"
		},

		{
			name: "Team Members",
			basic: "1",
			pro: "5",
			team: "Unlimited"
		},

		{
			name: "Support",
			basic: "Email",
			pro: "Priority",
			team: "Dedicated"
		},
		{ name: "Analytics", basic: true, pro: true, team: true },
		{ name: "Custom Webhooks", basic: false, pro: true, team: true },
		{ name: "SSO", basic: false, pro: false, team: true },
		{ name: "Audit Logs", basic: false, pro: false, team: true }
	];

	var section = root_5();
	var div = $.child(section);
	var node = $.sibling($.child(div), 2);

	Card(node, {
		variant: 'outline',
		class: 'mt-12 overflow-auto *:min-w-xl',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var div_1 = $.first_child(fragment);
			var node_1 = $.sibling($.child(div_1), 2);

			$.each(node_1, 17, () => plans, (plan) => plan.name, ($$anchor, plan) => {
				var div_2 = root();
				var p = $.child(div_2);
				var text = $.only_child(p, true);
				var p_1 = $.sibling(p, 2);
				var span = $.child(p_1);
				var text_1 = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_2 = $.only_child(span_1, true);

				$.reset(p_1);
				$.reset(div_2);

				$.template_effect(() => {
					$.set_class(div_2, 1, `border-l p-4 text-center ${$.get(plan).highlighted ? "bg-primary/5" : ""}`);
					$.set_text(text, $.get(plan).name);
					$.set_text(text_1, $.get(plan).price);
					$.set_text(text_2, $.get(plan).period);
				});

				$.append($$anchor, div_2);
			});

			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			$.each(node_2, 17, () => features, (feature) => feature.name, ($$anchor, feature) => {
				var div_3 = root_3();
				var div_4 = $.child(div_3);
				var text_3 = $.only_child(div_4, true);
				var node_3 = $.sibling(div_4, 2);

				$.each(node_3, 18, () => planKeys, (planKey) => planKey, ($$anchor, planKey, idx) => {
					const value = $.derived(() => $.get(feature)[planKey]);
					var div_5 = root_2();
					var node_4 = $.child(div_5);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_1 = $.comment();
							var node_5 = $.first_child(fragment_1);

							{
								var consequent = ($$anchor) => {
									Check($$anchor, { class: 'size-4 text-primary' });
								};

								var alternate = ($$anchor) => {
									Minus($$anchor, { class: 'size-4 text-muted-foreground' });
								};

								$.if(node_5, ($$render) => {
									if ($.get(value)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_1);
						};

						var alternate_1 = ($$anchor) => {
							var span_2 = root_1();
							var text_4 = $.only_child(span_2, true);

							$.template_effect(() => $.set_text(text_4, $.get(value)));
							$.append($$anchor, span_2);
						};

						$.if(node_4, ($$render) => {
							if (typeof $.get(value) === "boolean") $$render(consequent_1); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_5);
					$.template_effect(() => $.set_class(div_5, 1, `flex items-center justify-center border-l p-4 text-sm ${$.get(idx) === 1 ? "bg-primary/5" : ""}`));
					$.append($$anchor, div_5);
				});

				$.reset(div_3);
				$.template_effect(() => $.set_text(text_3, $.get(feature).name));
				$.append($$anchor, div_3);
			});

			var div_6 = $.sibling(node_2, 2);
			var node_6 = $.sibling($.child(div_6), 2);

			$.each(node_6, 17, () => plans, (plan) => plan.name, ($$anchor, plan) => {
				var div_7 = root_2();
				var node_7 = $.child(div_7);

				{
					let $0 = $.derived(() => $.get(plan).highlighted ? "default" : "outline");

					Button(node_7, {
						href: '#link',
						get variant() {
							return $.get($0);
						},
						size: 'sm',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(plan).cta));
							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div_7);
				$.template_effect(() => $.set_class(div_7, 1, `border-l p-4 ${$.get(plan).highlighted ? "bg-primary/5" : ""}`));
				$.append($$anchor, div_7);
			});

			$.reset(div_6);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}