import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from "@lucide/svelte/icons/check";
import Minus from "@lucide/svelte/icons/minus";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";

var root = $.from_html(`<span class="text-foreground"> </span>`);
var root_1 = $.from_html(`<span class="font-medium text-foreground"> </span>`);
var root_2 = $.from_html(`<div class="grid grid-cols-3 border-t"><div class="p-4 text-sm text-muted-foreground"> </div> <div class="flex min-w-32 items-center justify-center border-l p-4 text-sm"><!></div> <div class="flex min-w-32 items-center justify-center border-l bg-primary/5 p-4 text-sm"><!></div></div>`);
var root_3 = $.from_html(`<div class="grid grid-cols-3"><div class="p-4"></div> <div class="min-w-32 border-l p-4 text-center"><p class="font-medium text-foreground">Free</p> <p class="font-serif text-2xl font-medium">$0</p></div> <div class="min-w-32 border-l bg-primary/5 p-4 text-center"><p class="font-medium text-foreground">Pro</p> <p class="font-serif text-2xl font-medium">$29</p></div></div> <!> <div class="grid grid-cols-3 border-t"><div class="p-4"></div> <div class="min-w-32 border-l p-4"><!></div> <div class="min-w-32 border-l bg-primary/5 p-4"><!></div></div>`, 1);
var root_4 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Free vs Pro</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">See what you get with each plan.</p></div> <!></div></section>`);

export default function Comparator_two($$anchor) {
	const features = [
		{ name: "Integrations", free: "5", pro: "Unlimited" },
		{ name: "API Calls", free: "10K/mo", pro: "500K/mo" },
		{ name: "Team Members", free: "2", pro: "20" },
		{ name: "Support", free: "Email", pro: "Priority" },
		{ name: "Analytics Dashboard", free: false, pro: true },
		{ name: "Custom Webhooks", free: false, pro: true },
		{ name: "Advanced Security", free: false, pro: true },
		{ name: "API Access", free: false, pro: true }
	];

	var section = root_4();
	var div = $.child(section);
	var node = $.sibling($.child(div), 2);

	Card(node, {
		variant: 'outline',
		class: 'mt-12 overflow-auto @max-md:*:min-w-md',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_3();
			var node_1 = $.sibling($.first_child(fragment), 2);

			$.each(node_1, 17, () => features, (feature) => feature.name, ($$anchor, feature) => {
				var div_1 = root_2();
				var div_2 = $.child(div_1);
				var text = $.only_child(div_2, true);
				var div_3 = $.sibling(div_2, 2);
				var node_2 = $.child(div_3);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								Check($$anchor, { class: 'size-4 text-primary' });
							};

							var alternate = ($$anchor) => {
								Minus($$anchor, { class: 'size-4 text-muted-foreground/50' });
							};

							$.if(node_3, ($$render) => {
								if ($.get(feature).free) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_1);
					};

					var alternate_1 = ($$anchor) => {
						var span = root();
						var text_1 = $.only_child(span, true);

						$.template_effect(() => $.set_text(text_1, $.get(feature).free));
						$.append($$anchor, span);
					};

					$.if(node_2, ($$render) => {
						if (typeof $.get(feature).free === "boolean") $$render(consequent_1); else $$render(alternate_1, -1);
					});
				}

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_4 = $.child(div_4);

				{
					var consequent_3 = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_5 = $.first_child(fragment_4);

						{
							var consequent_2 = ($$anchor) => {
								Check($$anchor, { class: 'size-4 text-primary' });
							};

							var alternate_2 = ($$anchor) => {
								Minus($$anchor, { class: 'size-4 text-muted-foreground/50' });
							};

							$.if(node_5, ($$render) => {
								if ($.get(feature).pro) $$render(consequent_2); else $$render(alternate_2, -1);
							});
						}

						$.append($$anchor, fragment_4);
					};

					var alternate_3 = ($$anchor) => {
						var span_1 = root_1();
						var text_2 = $.only_child(span_1, true);

						$.template_effect(() => $.set_text(text_2, $.get(feature).pro));
						$.append($$anchor, span_1);
					};

					$.if(node_4, ($$render) => {
						if (typeof $.get(feature).pro === "boolean") $$render(consequent_3); else $$render(alternate_3, -1);
					});
				}

				$.reset(div_4);
				$.reset(div_1);
				$.template_effect(() => $.set_text(text, $.get(feature).name));
				$.append($$anchor, div_1);
			});

			var div_5 = $.sibling(node_1, 2);
			var div_6 = $.sibling($.child(div_5), 2);
			var node_6 = $.child(div_6);

			Button(node_6, {
				href: '#link',
				variant: 'outline',
				size: 'sm',
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Get Started');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var node_7 = $.child(div_7);

			Button(node_7, {
				href: '#link',
				size: 'sm',
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Upgrade');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);
			$.reset(div_5);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}