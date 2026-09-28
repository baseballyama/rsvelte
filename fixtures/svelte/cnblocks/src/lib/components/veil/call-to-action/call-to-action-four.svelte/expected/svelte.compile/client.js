import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Check from "@lucide/svelte/icons/check";

var root = $.from_html(`<li class="flex items-center gap-2 text-sm text-muted-foreground"><!> </li>`);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<div><h2 class="font-serif text-3xl font-medium text-balance"> </h2> <p class="mt-3 text-balance text-muted-foreground"> </p> <ul class="mt-6 space-y-2"></ul></div> <div class="flex flex-col justify-center rounded-xl border bg-muted/50 p-6"><p class="text-sm text-muted-foreground">Starting at</p> <p class="mt-1 font-serif text-4xl font-medium"> <span class="text-lg font-normal text-muted-foreground"> </span></p> <p class="mt-1 text-sm text-muted-foreground"> </p> <!></div>`, 1);
var root_3 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><!></div></section>`);

export default function Call_to_action_four($$anchor, $$props) {
	let title = $.prop($$props, 'title', 3, "Transform Your Workflow"),
		description = $.prop($$props, 'description', 3, "Experience the power of seamless integrations and watch your productivity soar."),
		benefits = $.prop($$props, 'benefits', 19, () => [
			"14-day free trial",
			"No credit card required",
			"Cancel anytime",
			"24/7 support"
		]),
		price = $.prop($$props, 'price', 3, "$0"),
		priceSuffix = $.prop($$props, 'priceSuffix', 3, "/month"),
		priceNote = $.prop($$props, 'priceNote', 3, "Free forever for individuals"),
		ctaLabel = $.prop($$props, 'ctaLabel', 3, "Get Started Free"),
		ctaHref = $.prop($$props, 'ctaHref', 3, "#link");

	var section = root_3();
	var div = $.child(section);
	var node = $.child(div);

	Card(node, {
		variant: 'outline',
		class: 'grid gap-8 p-6 md:p-8 @xl:grid-cols-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var div_1 = $.first_child(fragment);
			var h2 = $.child(div_1);
			var text = $.only_child(h2, true);
			var p = $.sibling(h2, 2);
			var text_1 = $.only_child(p, true);
			var ul = $.sibling(p, 2);

			$.each(ul, 23, benefits, (benefit, index) => `${index}-${benefit}`, ($$anchor, benefit) => {
				var li = root();
				var node_1 = $.child(li);

				Check(node_1, { class: 'size-4 text-primary' });

				var text_2 = $.sibling(node_1);

				$.reset(li);
				$.template_effect(() => $.set_text(text_2, ` ${$.get(benefit) ?? ''}`));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var p_1 = $.sibling($.child(div_2), 2);
			var text_3 = $.child(p_1, true);
			var span = $.sibling(text_3);
			var text_4 = $.only_child(span, true);

			$.reset(p_1);

			var p_2 = $.sibling(p_1, 2);
			var text_5 = $.only_child(p_2, true);
			var node_2 = $.sibling(p_2, 2);

			Button(node_2, {
				get href() {
					return ctaHref();
				},
				class: 'mt-6 gap-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root_1();
					var text_6 = $.first_child(fragment_1);
					var node_3 = $.sibling(text_6);

					ArrowRight(node_3, { class: 'size-4' });
					$.template_effect(() => $.set_text(text_6, `${ctaLabel() ?? ''} `));
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			$.template_effect(() => {
				$.set_text(text, title());
				$.set_text(text_1, description());
				$.set_text(text_3, price());
				$.set_text(text_4, priceSuffix());
				$.set_text(text_5, priceNote());
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}