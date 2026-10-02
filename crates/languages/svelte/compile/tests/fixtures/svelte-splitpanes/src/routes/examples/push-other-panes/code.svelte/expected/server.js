import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function Code($$renderer) {
	Splitpanes($$renderer, {
		style: 'height: 400px',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like({ length: 8 });

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let _ = each_array[i];

				Pane($$renderer, {
					minSize: 5,
					children: ($$renderer) => {
						$$renderer.push(`<span>${$.escape(i + 1)}</span> <p>Double click splitter -></p>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}