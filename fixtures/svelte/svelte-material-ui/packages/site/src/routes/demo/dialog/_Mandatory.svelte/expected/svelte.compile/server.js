import * as $ from 'svelte/internal/server';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Button, { Label } from '@smui/button';

export default function _Mandatory($$renderer) {
	let open = false;
	let response = 'Nothing yet.';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dialog($$renderer, {
			scrimClickAction: '',
			escapeKeyAction: '',
			'aria-labelledby': 'mandatory-title',
			'aria-describedby': 'mandatory-content',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Title($$renderer, {
					id: 'mandatory-title',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Webpage Troll`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					id: 'mandatory-content',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Before you continue on this page, you must answer my riddle of age. When
    Alice was six her brother was half, now Alice is 90, you do the math. <br/><br/> How old is Alice's brother now?`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Actions($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							onclick: () => response = 'Wrong answer. Thrown in the lake.',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Fifty`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: () => response = 'You are correct. You may pass.',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Eighty-Seven`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: () => response = 'Wrong answer. Thrown in the lake.',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Forty-Five`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: () => response = 'Wrong answer. Thrown in the lake.',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Seventy-Five`);
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

		$$renderer.push(`<!----> <pre class="status">Result: ${$.escape(response)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}