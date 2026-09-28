import * as $ from 'svelte/internal/server';
import { Button, MenuButton, MenuItem } from "carbon-components-svelte";

export default function MenuButtonFixture($$renderer) {
	let open = false;
	let selectedAction = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			'data-testid': 'open-externally',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open externally`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		MenuButton($$renderer, {
			labelText: 'Actions',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				MenuItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Cut`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Copy`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Paste`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MenuItem($$renderer, {
					labelText: 'Export as',
					children: ($$renderer) => {
						MenuItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->PDF`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						MenuItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->JPG`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						MenuItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->PNG`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (selectedAction) {
			$$renderer.push(`<!--[0--><p data-testid="selected-action">Selected: ${$.escape(selectedAction)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}