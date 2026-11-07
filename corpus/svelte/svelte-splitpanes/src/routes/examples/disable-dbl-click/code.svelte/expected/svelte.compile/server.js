import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function Code($$renderer) {
	Splitpanes($$renderer, {
		horizontal: true,
		style: 'height: 400px',
		dblClickSplitter: false,
		children: ($$renderer) => {
			Pane($$renderer, {
				size: 33,
				children: ($$renderer) => {
					$$renderer.push(`<span>1</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				size: 33,
				children: ($$renderer) => {
					$$renderer.push(`<p>Note how double clicking has no resizing effects..</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				size: 34,
				children: ($$renderer) => {
					$$renderer.push(`<span>3</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}