import * as $ from 'svelte/internal/server';
import { Button, ContentSwitcher, Stack, Switch } from "carbon-components-svelte";

export default function ContentSwitcherReactive($$renderer) {
	let selectedIndex = 1;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ContentSwitcher($$renderer, {
			get selectedIndex() {
				return selectedIndex;
			},

			set selectedIndex($$value) {
				selectedIndex = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Switch($$renderer, { text: 'Latest news' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { text: 'Trending' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { text: 'Recommended' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				Button($$renderer, {
					size: 'small',
					disabled: selectedIndex === 2,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Set selected to 2`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>Selected index: ${$.escape(selectedIndex)}</div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}