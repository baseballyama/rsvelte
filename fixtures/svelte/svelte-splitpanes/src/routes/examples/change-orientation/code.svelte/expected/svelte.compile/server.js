import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import Button from '$comp/Button.svelte';

export default function Code($$renderer) {
	let horizontal = false;
	let firstSplitter = false;

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(horizontal ? 'Turn to Vertical' : 'Turn to Horizontal')}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(firstSplitter ? 'Hide first splitter' : 'Show first Splitter')}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Splitpanes($$renderer, {
		style: 'height: 400px',
		firstSplitter,
		horizontal,
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like({ length: 3 });

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let _ = each_array[i];

				Pane($$renderer, {
					minSize: 5,
					children: ($$renderer) => {
						$$renderer.push(`<span>${$.escape(i + 1)}</span>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}