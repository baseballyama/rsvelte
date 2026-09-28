import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function Code($$renderer) {
	Splitpanes($$renderer, {
		horizontal: true,
		style: 'height: 400px',
		pushOtherPanes: false,
		children: ($$renderer) => {
			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span>1</span> <p>Try grabbing to very bottom splitter, note how it stops on the bounderies of this panel</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				children: ($$renderer) => {
					Splitpanes($$renderer, {
						children: ($$renderer) => {
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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span>5</span> <p>Try grabbing to very top splitter, note how it stops on the bounderies of this panel</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}