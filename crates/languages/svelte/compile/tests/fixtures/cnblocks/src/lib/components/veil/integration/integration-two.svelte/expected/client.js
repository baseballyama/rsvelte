import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/veil/button";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import IntegrationIllustrationTwo from "./integration-illustration-two.svelte";

var root = $.from_html(`Learn more <!>`, 1);
var root_1 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl"><!> <div class="mx-auto mt-12 max-w-md px-6 text-center text-balance"><h2 class="font-serif text-4xl font-medium">Connect Your Favorite Tools</h2> <p class="mt-4 mb-6 text-muted-foreground">Seamlessly integrate with the services you already use. Set up in minutes, not days.</p> <!></div></div></section>`);

export default function Integration_two($$anchor) {
	var section = root_1();
	var div = $.child(section);
	var node = $.child(div);

	IntegrationIllustrationTwo(node, {});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div_1), 4);

	Button(node_1, {
		variant: 'secondary',
		size: 'sm',
		class: 'gap-1 pr-1.5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_2 = $.sibling($.first_child(fragment));

			ChevronRight(node_2, {});
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}