import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card from "$lib/components/ui/card/card.svelte";
import { cn } from "$lib/utils";

const cardDecorator = ($$anchor) => {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
};

var root = $.from_html(
	`<span class="absolute -top-px -left-px block size-2 border-primary" style="
      border-top-width: 2px;
      border-left-width: 2px;"></span> <span class="absolute -top-px -right-px block size-2 border-primary" style="
      border-top-width: 2px;
      border-right-width: 2px;"></span> <span class="absolute -bottom-px -left-px block size-2 border-primary" style="
      border-bottom-width: 2px;
      border-left-width: 2px;"></span> <span class="absolute -right-px -bottom-px block size-2 border-primary" style="
      border-bottom-width: 2px;
      border-right-width: 2px;"></span>`,
	1
);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function Feature_card($$anchor, $$props) {
	$.push($$props, true);

	let _class = $.prop($$props, 'class', 3, "");

	{
		let $0 = $.derived(() => cn("group relative rounded-none shadow-zinc-950/5", _class()));

		Card($$anchor, {
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node = $.first_child(fragment_2);

				cardDecorator(node);

				var node_1 = $.sibling(node, 2);

				$.snippet(node_1, () => $$props.children);
				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}