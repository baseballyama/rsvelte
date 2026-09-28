import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Item from "./item.svelte";

export default function Projects($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => ({ length: 6 }), $.index, ($$anchor, _, i) => {
		Item($$anchor, {
			value: `Project ${i + 1}`,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				text.nodeValue = `Project ${i + 1}`;
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}