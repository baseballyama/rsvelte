import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';

export default function _page($$renderer) {
	const url = 'https://orefalo.github.io/svelte-splitpanes/';

	$$renderer.push(`<h1>Welcome to Svelte-Splitpanes Minimal Demo!</h1> <p>Visit <a${$.attr('href', url)}>https://orefalo.github.io/svelte-splitpanes/</a> to read the documentation and for more examples.</p> `);

	Splitpanes($$renderer, {
		style: 'height: 400px;',
		children: ($$renderer) => {
			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->First Pane`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Second Pane`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}