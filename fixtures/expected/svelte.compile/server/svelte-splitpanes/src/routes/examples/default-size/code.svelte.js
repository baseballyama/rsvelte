import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function Code($$renderer) {
	Splitpanes($$renderer, {
		horizontal: true,
		style: 'height: 400px',
		children: ($$renderer) => {
			Pane($$renderer, {
				size: 65,
				children: ($$renderer) => {
					$$renderer.push(`<span>1</span> <p>Default size of 65%</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				size: 10,
				children: ($$renderer) => {
					$$renderer.push(`<span>2</span> <p>Default size of 10%</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				size: 25,
				children: ($$renderer) => {
					$$renderer.push(`<span>3</span> <p>Default size of 25%</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}