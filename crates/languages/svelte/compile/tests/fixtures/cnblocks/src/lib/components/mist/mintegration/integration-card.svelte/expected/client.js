import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import Card from "$lib/components/ui/card/card.svelte";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

var root = $.from_html(`<div class="relative"><div class="*:size-10"><!></div> <div class="mt-6 space-y-1.5"><h3 class="text-lg font-semibold"> </h3> <p class="line-clamp-2 text-muted-foreground"> </p></div></div>`);

export default function Integration_card($$anchor, $$props) {
	Card($$anchor, {
		variant: 'soft',
		class: 'p-6',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			$.snippet(node, () => $$props.children ?? $.noop);
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var h3 = $.child(div_2);
			var text = $.only_child(h3, true);
			var p = $.sibling(h3, 2);
			var text_1 = $.only_child(p, true);

			$.reset(div_2);
			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, $$props.title);
				$.set_text(text_1, $$props.description);
			});

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}