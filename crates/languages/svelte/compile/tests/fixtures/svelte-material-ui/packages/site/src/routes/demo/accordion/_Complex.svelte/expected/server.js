import * as $ from 'svelte/internal/server';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
import Button from '@smui/button';
import Tooltip, { Wrapper } from '@smui/tooltip';
import { Label } from '@smui/common';
import Menu from '@smui/menu';
import List, { Item, Text } from '@smui/list';
import Dialog, { Title, Content as DialogContent, Actions } from '@smui/dialog';

export default function _Complex($$renderer) {
	let menu;
	let dialogOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="accordion-container">`);

		Accordion($$renderer, {
			children: ($$renderer) => {
				Panel($$renderer, {
					children: ($$renderer) => {
						Header($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Panel with Simple Content`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->This panel has boring content.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Panel($$renderer, {
					children: ($$renderer) => {
						Header($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Panel with Extravagent Content`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<div style="display: flex; justify-content: space-between; align-items: center;">This panel has really cool content! `);

								Wrapper($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div style="display: inline-block;">`);

										Button($$renderer, {
											onclick: () => menu.setOpen(true),
											children: ($$renderer) => {
												Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Really?`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Menu($$renderer, {
											children: ($$renderer) => {
												List($$renderer, {
													children: ($$renderer) => {
														Item($$renderer, {
															onSMUIAction: () => {
																dialogOpen = true;
															},

															children: ($$renderer) => {
																Text($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Yes!`);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div> `);

										Tooltip($$renderer, {
											yPos: 'below',
											children: ($$renderer) => {
												Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->This tooltip should extend outside the panel!`);
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

								$$renderer.push(`<!----></div> `);

								Dialog($$renderer, {
									'aria-labelledby': 'complex-accordion-dialog-title',
									'aria-describedby': 'complex-accordion-dialog-content',
									get open() {
										return dialogOpen;
									},

									set open($$value) {
										dialogOpen = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										Title($$renderer, {
											id: 'complex-accordion-dialog-title',
											children: ($$renderer) => {
												$$renderer.push(`<!---->A Dialog!`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										DialogContent($$renderer, {
											id: 'complex-accordion-dialog-content',
											children: ($$renderer) => {
												$$renderer.push(`<!---->This dialog is even a child of the panel!`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Actions($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													defaultAction: true,
													children: ($$renderer) => {
														Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Wow!`);
															},
															$$slots: { default: true }
														});
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

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Panel($$renderer, {
					children: ($$renderer) => {
						Header($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Panel with Simple Content`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->This panel has boring content.`);
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

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}