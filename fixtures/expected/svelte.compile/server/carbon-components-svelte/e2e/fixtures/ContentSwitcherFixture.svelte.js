import * as $ from 'svelte/internal/server';
import { ContentSwitcher, Switch } from "carbon-components-svelte";

export default function ContentSwitcherFixture($$renderer) {
	let selectedIndex = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ContentSwitcher($$renderer, {
			'data-testid': 'content-switcher',
			get selectedIndex() {
				return selectedIndex;
			},

			set selectedIndex($$value) {
				selectedIndex = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Switch($$renderer, { text: 'First', selected: true });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { text: 'Second' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { text: 'Third' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p data-testid="selected-index">Selected: ${$.escape(selectedIndex)}</p>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}