import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function Code($$renderer) {
	Splitpanes($$renderer, {
		theme: 'my-theme',
		horizontal: true,
		style: 'height: 400px',
		children: ($$renderer) => {
			Pane($$renderer, {
				children: ($$renderer) => {
					Splitpanes($$renderer, {
						theme: 'my-theme',
						children: ($$renderer) => {
							Pane($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span>1</span>`);
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
								children: ($$renderer) => {
									$$renderer.push(`<span>3</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<em class="specs"><p>In this example the splitters are thin lines but the reactive touch zone is spread to 30
        pixels all around!</p></em>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}