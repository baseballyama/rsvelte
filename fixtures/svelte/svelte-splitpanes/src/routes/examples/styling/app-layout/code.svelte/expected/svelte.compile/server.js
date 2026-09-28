import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function Code($$renderer) {
	Splitpanes($$renderer, {
		theme: 'no-splitter',
		horizontal: true,
		style: 'height: 400px',
		dblClickSplitter: false,
		children: ($$renderer) => {
			Pane($$renderer, {
				size: 6,
				minSize: 6,
				maxSize: 6,
				children: ($$renderer) => {
					$$renderer.push(`<p>MenuBar - This is a splitpane, note how the splitters made static using CSS</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				size: 6,
				minSize: 6,
				maxSize: 6,
				children: ($$renderer) => {
					$$renderer.push(`<p>ToolBar - This is another fixed size, locked splitpane</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				children: ($$renderer) => {
					Splitpanes($$renderer, {
						theme: 'modern-theme',
						children: ($$renderer) => {
							Pane($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p>Folder <br/> You can move those --></p>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Pane($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p>Sample content</p>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Pane($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p>Details <br/> &lt;-- You can move those</p>`);
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
				size: 6,
				minSize: 6,
				maxSize: 6,
				children: ($$renderer) => {
					$$renderer.push(`<p>statusbar - and yet, another splitpane, same technique</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}