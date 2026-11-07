import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import ArrowRight from "@lucide/svelte/icons/arrow-right";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<div class="mb-6 text-sm font-medium text-muted-foreground"> </div> <h2 class="font-serif text-3xl font-medium text-balance md:text-4xl"> </h2> <p class="mt-4 max-w-md text-balance text-muted-foreground"> </p> <!>`, 1);
var root_2 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><!></div></section>`);

export default function Call_to_action_two($$anchor, $$props) {
	let eyebrow = $.prop($$props, 'eyebrow', 3, "Limited Time Offer"),
		title = $.prop($$props, 'title', 3, "Start Building Today"),
		description = $.prop($$props, 'description', 3, "Get 3 months free when you sign up for an annual plan. No credit card required to start."),
		ctaLabel = $.prop($$props, 'ctaLabel', 3, "Claim Your Offer"),
		ctaHref = $.prop($$props, 'ctaHref', 3, "#link");

	var section = root_2();
	var div = $.child(section);
	var node = $.child(div);

	Card(node, {
		variant: 'outline',
		class: 'p-8 md:p-12',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var div_1 = $.first_child(fragment);
			var text = $.only_child(div_1, true);
			var h2 = $.sibling(div_1, 2);
			var text_1 = $.only_child(h2, true);
			var p = $.sibling(h2, 2);
			var text_2 = $.only_child(p, true);
			var node_1 = $.sibling(p, 2);

			Button(node_1, {
				get href() {
					return ctaHref();
				},
				class: 'mt-8 gap-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();
					var text_3 = $.first_child(fragment_1);
					var node_2 = $.sibling(text_3);

					ArrowRight(node_2, { class: 'size-4' });
					$.template_effect(() => $.set_text(text_3, `${ctaLabel() ?? ''} `));
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => {
				$.set_text(text, eyebrow());
				$.set_text(text_1, title());
				$.set_text(text_2, description());
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}