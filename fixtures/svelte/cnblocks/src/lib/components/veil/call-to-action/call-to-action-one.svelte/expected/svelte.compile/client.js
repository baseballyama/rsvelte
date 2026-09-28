import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/veil/button";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

var root = $.from_html(`<span> </span> <!>`, 1);
var root_1 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance"> </h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground"> </p> <div class="mt-6 flex flex-wrap justify-center gap-3"><!> <!></div></div></div></section>`);

export default function Call_to_action_one($$anchor, $$props) {
	let title = $.prop($$props, 'title', 3, "Ready to Get Started?"),
		description = $.prop($$props, 'description', 3, "Join thousands of teams already using our platform to build better products faster."),
		primaryLabel = $.prop($$props, 'primaryLabel', 3, "Start Free Trial"),
		primaryHref = $.prop($$props, 'primaryHref', 3, "#link"),
		secondaryLabel = $.prop($$props, 'secondaryLabel', 3, "Talk to Sales"),
		secondaryHref = $.prop($$props, 'secondaryHref', 3, "#link");

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var h2 = $.child(div_1);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);
	var div_2 = $.sibling(p, 2);
	var node = $.child(div_2);

	Button(node, {
		get href() {
			return primaryHref();
		},
		class: 'pr-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var span = $.first_child(fragment);
			var text_2 = $.only_child(span, true);
			var node_1 = $.sibling(span, 2);

			ChevronRight(node_1, { class: 'opacity-50' });
			$.template_effect(() => $.set_text(text_2, primaryLabel()));
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		variant: 'secondary',
		get href() {
			return secondaryHref();
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text();

			$.template_effect(() => $.set_text(text_3, secondaryLabel()));
			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);

	$.template_effect(() => {
		$.set_text(text, title());
		$.set_text(text_1, description());
	});

	$.append($$anchor, section);
}