import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<div class="text-sm"> </div> <!>`, 1);
var root_1 = $.from_html(`<div class="p-4"><h4 class="mb-4 text-sm leading-none font-medium">Tags</h4> <!></div>`);

export default function Scroll_area_demo($$anchor, $$props) {
	$.push($$props, true);

	const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);

	ScrollArea($$anchor, {
		class: 'h-72 w-48 rounded-md border',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.sibling($.child(div), 2);

			$.each(node, 16, () => tags, (tag) => tag, ($$anchor, tag) => {
				var fragment_1 = root();
				var div_1 = $.first_child(fragment_1);
				var text = $.only_child(div_1, true);
				var node_1 = $.sibling(div_1, 2);

				Separator(node_1, { class: 'my-2' });
				$.template_effect(() => $.set_text(text, tag));
				$.append($$anchor, fragment_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}