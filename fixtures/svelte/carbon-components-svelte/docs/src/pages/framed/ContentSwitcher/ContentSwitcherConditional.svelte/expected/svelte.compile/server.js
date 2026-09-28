import * as $ from 'svelte/internal/server';
import { Checkbox, ContentSwitcher, Stack, Switch } from "carbon-components-svelte";

export default function ContentSwitcherConditional($$renderer) {
	let selectedIndex = 0;
	let showAdmin = true;
	let showSettings = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 3,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				Checkbox($$renderer, {
					labelText: 'Show Admin switch',
					get checked() {
						return showAdmin;
					},

					set checked($$value) {
						showAdmin = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					labelText: 'Show Settings switch',
					get checked() {
						return showSettings;
					},

					set checked($$value) {
						showSettings = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div><strong>Selected index:</strong> ${$.escape(selectedIndex)}</div> `);

				ContentSwitcher($$renderer, {
					get selectedIndex() {
						return selectedIndex;
					},

					set selectedIndex($$value) {
						selectedIndex = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Switch($$renderer, { text: 'Dashboard' });
						$$renderer.push(`<!----> `);

						if (showAdmin) {
							$$renderer.push('<!--[0-->');
							Switch($$renderer, { text: 'Admin' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (showSettings) {
							$$renderer.push('<!--[0-->');
							Switch($$renderer, { text: 'Settings' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						Switch($$renderer, { text: 'Profile' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}