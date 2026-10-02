import * as $ from 'svelte/internal/server';

import Dialog, {
	Header,
	Title,
	CloseTooltipWrapper,
	Content,
	Actions,
	InitialFocus
} from '@smui/dialog';

import IconButton, { Icon } from '@smui/icon-button';
import Button, { Label } from '@smui/button';
import List, { Item, Graphic, Text } from '@smui/list';
import Radio from '@smui/radio';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _OverFullscreen($$renderer) {
	let open = false;
	let subOpen = false;
	let selection = 'Radishes';
	let selected = 'Nothing yet.';
	let response = 'Nothing yet.';

	function confirmationCloseHandler(e) {
		if (e.detail.action === 'accept') {
			selected = selection;
		}

		selection = 'Radishes';
	}

	function closeHandler(e) {
		switch (e.detail.action) {
			case 'close':
				response = 'Closed without response.';
				break;

			case 'reject':
				response = 'Rejected.';
				break;

			case 'accept':
				response = 'Accepted.';
				break;
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function over($$renderer) {
				Dialog($$renderer, {
					selection: true,
					'aria-labelledby': 'over-fullscreen-confirmation-title',
					'aria-describedby': 'over-fullscreen-confirmation-content',
					onSMUIDialogClosed: confirmationCloseHandler,
					get open() {
						return subOpen;
					},

					set open($$value) {
						subOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Header($$renderer, {
							children: ($$renderer) => {
								Title($$renderer, {
									id: 'over-fullscreen-confirmation-title',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Confirmation`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							id: 'over-fullscreen-confirmation-content',
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
															value: 'One',
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
														$$renderer.push(`<!---->Choice 1`);
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
															value: 'Two',
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
														$$renderer.push(`<!---->Choice 2`);
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
			}

			Dialog($$renderer, {
				fullscreen: true,
				'aria-labelledby': 'over-fullscreen-title',
				'aria-describedby': 'over-fullscreen-content',
				onSMUIDialogClosed: closeHandler,
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				},
				over,
				children: ($$renderer) => {
					Header($$renderer, {
						children: ($$renderer) => {
							Title($$renderer, {
								id: 'over-fullscreen-title',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Terms and Conditions`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							CloseTooltipWrapper($$renderer, {
								children: ($$renderer) => {
									IconButton($$renderer, {
										action: 'close',
										children: ($$renderer) => {
											Icon($$renderer, {
												class: 'material-icons',
												children: ($$renderer) => {
													$$renderer.push(`<!---->close`);
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

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						id: 'over-fullscreen-content',
						children: ($$renderer) => {
							Button($$renderer, {
								onclick: () => subOpen = true,
								children: ($$renderer) => {
									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Open Confirmation Dialog`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(Array(3));

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let _item = each_array[$$index];

								LoremIpsum($$renderer, {});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Actions($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								action: 'reject',
								children: ($$renderer) => {
									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Reject`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								action: 'accept',
								defaultAction: true,
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
				$$slots: { over: true, default: true }
			});
		}

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

		$$renderer.push(`<!----> <pre class="status">Response: ${$.escape(response)}, Selected: ${$.escape(selected)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}