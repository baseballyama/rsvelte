import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

var root = $.from_html(`Learn More <!>`, 1);

var root_1 = $.from_html(`<section class="py-16 md:py-32"><div class="mx-auto max-w-5xl px-6"><div class="grid gap-6 md:grid-cols-2 md:gap-12"><h2 class="text-4xl font-medium">The Lyra ecosystem brings together our models, products and platforms.</h2> <div class="space-y-6"><p>Lyra is evolving to be more than just the models. It supports an entire
					ecosystem — from products to the APIs and platforms helping developers and
					businesses innovate.</p> <p>Tailus UI. <span class="font-bold">It supports an entire ecosystem</span> — from products
					innovate. Sit minus, quod debitis autem quia aspernatur delectus impedit modi, neque
					non id ad dignissimos? Saepe deleniti perferendis beatae.</p> <!></div></div></div></section>`);

export default function Content_four($$anchor) {
	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.sibling($.child(div_2), 4);

	Button(node, {
		variant: 'secondary',
		size: 'sm',
		class: 'gap-1 pr-1.5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment));

			ChevronRight(node_1, { class: 'size-2' });
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}