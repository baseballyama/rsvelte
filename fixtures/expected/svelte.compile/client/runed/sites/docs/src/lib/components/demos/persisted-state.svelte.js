import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PersistedState } from "runed";
import { Button, DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<div class="flex items-center gap-3"><!> <!> <!></div> <pre class="bg-transparent p-0 font-mono"> </pre>`, 1);

export default function Persisted_state($$anchor, $$props) {
	$.push($$props, true);

	const count = new PersistedState("persisted-state-demo-count", 0);

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Button(node, {
				variant: 'brand',
				size: 'sm',
				onclick: () => count.current++,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Increment');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				variant: 'brand',
				size: 'sm',
				onclick: () => count.current--,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Decrement');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				variant: 'ghost',
				size: 'sm',
				onclick: () => count.current = 0,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Reset');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var pre = $.sibling(div, 2);
			var text_3 = $.only_child(pre);

			$.template_effect(() => $.set_text(text_3, `Count: ${`${count.current}`}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}