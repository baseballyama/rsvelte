import * as $ from 'svelte/internal/server';
import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
import Button, { Label } from '@smui/button';
import List, { Item, Graphic, Text } from '@smui/list';
import Radio from '@smui/radio';

export default function _Selection($$renderer) {
	let open = false;
	let selection = 'Radishes';
	let selected = 'Nothing yet.';

	function closeHandler(e) {
		if (e.detail.action === 'accept') {
			selected = selection;
		}

		selection = 'Radishes';
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dialog($$renderer, {
			selection: true,
			'aria-labelledby': 'list-selection-title',
			'aria-describedby': 'list-selection-content',
			onSMUIDialogClosed: closeHandler,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Title($$renderer, {
					id: 'list-selection-title',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Dialog Title`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					id: 'list-selection-content',
					children: ($$renderer) => {
						List($$renderer, {
							radioList: true,
							children: ($$renderer) => {
								Item($$renderer, {
									use: [InitialFocus],
									children: ($$renderer) => {
										Graphic($$renderer, {
											children: ($$renderer) => {
												Radio($$renderer, {
													value: 'Radishes',
													get group() {
														return selection;
													},

													set group($$value) {
														selection = $$value;
														$$settled = false;
													}
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Radishes`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									children: ($$renderer) => {
										Graphic($$renderer, {
											children: ($$renderer) => {
												Radio($$renderer, {
													value: 'Turnips',
													get group() {
														return selection;
													},

													set group($$value) {
														selection = $$value;
														$$settled = false;
													}
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Turnips`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									children: ($$renderer) => {
										Graphic($$renderer, {
											children: ($$renderer) => {
												Radio($$renderer, {
													value: 'Broccoli',
													get group() {
														return selection;
													},

													set group($$value) {
														selection = $$value;
														$$settled = false;
													}
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Broccoli`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Actions($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Cancel`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							action: 'accept',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Accept`);
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

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(selected)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}