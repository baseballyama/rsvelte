import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function Code($$renderer) {
	Splitpanes($$renderer, {
		style: 'height: 400px',
		children: ($$renderer) => {
			Pane($$renderer, {});
			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				snapSize: 10,
				minSize: 10,
				maxSize: 70,
				children: ($$renderer) => {
					$$renderer.push(`<span style="font-size: 20px;">I have a snap size of 10% <br/> I have a min size of 10% <br/> I have a max size of 70%</span>`);
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