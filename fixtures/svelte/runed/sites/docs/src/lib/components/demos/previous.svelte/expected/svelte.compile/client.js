import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Previous } from "runed";
import { Button, DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<!> <pre class="m-0 mt-4 bg-transparent p-0 font-mono"> </pre>`, 1);

export default function Previous_1($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	const previous = new Previous(() => $.get(count));

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				variant: 'brand',
				onclick: () => $.update(count),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, `Count: ${$.get(count) ?? ''}`));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var pre = $.sibling(node, 2);
			var text_1 = $.only_child(pre);

			$.template_effect(() => $.set_text(text_1, `Previous: ${`${previous.current}`}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}