import * as $ from 'svelte/internal/server';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Button, { Label } from '@smui/button';

export default function _Simple($$renderer) {
	let open = false;
	let clicked = 'Nothing yet.';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dialog($$renderer, {
			'aria-labelledby': 'simple-title',
			'aria-describedby': 'simple-content',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Title($$renderer, {
					id: 'simple-title',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Dialog Title`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					id: 'simple-content',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Super awesome dialog body text?`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Actions($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							onclick: () => clicked = 'No',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->No`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: () => clicked = 'Yes',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Yes`);
									},
									$$slots: { default: true }
								});
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

		Button($$renderer, {
			onclick: () => open = true,
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Dialog`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}