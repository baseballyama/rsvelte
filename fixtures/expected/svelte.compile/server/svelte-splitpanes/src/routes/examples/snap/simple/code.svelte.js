import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function Code($$renderer) {
	Splitpanes($$renderer, {
		style: 'height: 400px',
		children: ($$renderer) => {
			Pane($$renderer, {
				snapSize: 10,
				children: ($$renderer) => {
					$$renderer.push(`<p>Try shrinking my size, note how I snap below 10% size</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Pane($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}