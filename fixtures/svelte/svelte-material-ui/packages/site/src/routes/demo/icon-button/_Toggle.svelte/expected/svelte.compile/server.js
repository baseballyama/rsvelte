import * as $ from 'svelte/internal/server';
import IconButton, { Icon } from '@smui/icon-button';
import Button, { Label } from '@smui/button';

export default function _Toggle($$renderer) {
	let toggleClicked = 0;
	let initialOff = false;
	let initialOn = true;
	let usingEvents = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div style="display: flex; align-items: center;">`);

		IconButton($$renderer, {
			onclick: () => toggleClicked++,
			toggle: true,
			get pressed() {
				return initialOff;
			},

			set pressed($$value) {
				initialOff = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Icon($$renderer, {
					class: 'material-icons',
					on: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->star`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->star_border`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div style="display: flex; align-items: center;">`);

		IconButton($$renderer, {
			onclick: () => toggleClicked++,
			toggle: true,
			get pressed() {
				return initialOn;
			},

			set pressed($$value) {
				initialOn = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Icon($$renderer, {
					class: 'material-icons',
					on: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->alarm_on`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->alarm_off`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->   `);

		Button($$renderer, {
			onclick: () => initialOn = !initialOn,
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle Programmatically`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div style="display: flex; align-items: center;">`);

		IconButton($$renderer, {
			onclick: () => {
				toggleClicked++;
				usingEvents = !usingEvents;
			},
			pressed: usingEvents,
			children: ($$renderer) => {
				Icon($$renderer, {
					class: 'material-icons',
					on: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->bookmark`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->bookmark_border`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> Using events instead of bound variables.</div> <pre class="status">Clicked: ${$.escape(toggleClicked)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}