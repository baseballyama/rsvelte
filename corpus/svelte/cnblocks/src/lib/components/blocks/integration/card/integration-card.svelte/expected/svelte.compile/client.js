import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import Card from "$lib/components/ui/card/card.svelte";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

var root = $.from_html(`Learn More <!>`, 1);
var root_1 = $.from_html(`<div class="relative"><div class="*:size-10"><!></div> <div class="space-y-2 py-6"><h3 class="text-base font-medium"> </h3> <p class="line-clamp-2 text-sm text-muted-foreground"> </p></div> <div class="flex gap-3 border-t border-dashed pt-6"><!></div></div>`);

export default function Integration_card($$anchor, $$props) {
	let link = $.prop($$props, 'link', 3, "https://github.com/SikandarJODD/cnblocks");

	Card($$anchor, {
		class: 'p-6',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
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

			var div_3 = $.sibling(div_2, 2);
			var node_1 = $.child(div_3);

			Button(node_1, {
				variant: 'secondary',
				size: 'sm',
				class: 'gap-1 pr-2 shadow-none',
				get href() {
					return link();
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();
					var node_2 = $.sibling($.first_child(fragment_1));

					ChevronRight(node_2, { class: 'ml-0 size-3.5! opacity-50' });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
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