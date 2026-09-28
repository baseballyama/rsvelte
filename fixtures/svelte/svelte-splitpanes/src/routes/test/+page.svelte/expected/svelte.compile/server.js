import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function _page($$renderer) {
	Splitpanes($$renderer, {
		id: 'mysplitpane',
		horizontal: true,
		style: 'height: 400px',
		children: ($$renderer) => {
			Pane($$renderer, {
				size: 65,
				children: ($$renderer) => {
					$$renderer.push(`<span>1</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				size: 10,
				children: ($$renderer) => {
					$$renderer.push(`<span>2</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span>3</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span>4</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}