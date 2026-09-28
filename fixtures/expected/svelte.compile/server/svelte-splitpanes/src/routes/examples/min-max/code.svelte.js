import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function Code($$renderer) {
	Splitpanes($$renderer, {
		horizontal: true,
		style: 'height: 400px',
		children: ($$renderer) => {
			Pane($$renderer, {
				minSize: 20,
				maxSize: 70,
				children: ($$renderer) => {
					$$renderer.push(`<span>1 <br/> <em class="specs">I have a min height of 20% &amp; max height of 70%</em></span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span>2</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				maxSize: 70,
				children: ($$renderer) => {
					$$renderer.push(`<span>3 <br/> <em class="specs">I have a max height of 70%</em></span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}