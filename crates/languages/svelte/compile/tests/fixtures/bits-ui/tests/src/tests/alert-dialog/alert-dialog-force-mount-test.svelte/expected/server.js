import * as $ from 'svelte/internal/server';
import { AlertDialog } from "bits-ui";

export default function Alert_dialog_force_mount_test($$renderer, $$props) {
	let {
		open = false,
		contentProps = {},
		portalProps = {},
		titleProps = {},
		descriptionProps = {},
		withOpenCheck = false,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main>`);

		if (AlertDialog.Root) {
			$$renderer.push('<!--[-->');

			AlertDialog.Root($$renderer, $.spread_props([
				restProps,
				{
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Trigger) {
							$$renderer.push('<!--[-->');

							AlertDialog.Trigger($$renderer, {
								'data-testid': 'trigger',
								children: ($$renderer) => {
									$$renderer.push(`<!---->open`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (AlertDialog.Portal) {
							$$renderer.push('<!--[-->');

							AlertDialog.Portal($$renderer, $.spread_props([
								portalProps,
								{
									children: ($$renderer) => {
										if (withOpenCheck) {
											$$renderer.push('<!--[0-->');

											{
												function child($$renderer, { props, open }) {
													if (open) {
														$$renderer.push(`<!--[0--><div${$.attributes({ ...props })}></div>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												}

												if (AlertDialog.Overlay) {
													$$renderer.push('<!--[-->');

													AlertDialog.Overlay($$renderer, {
														forceMount: true,
														'data-testid': 'overlay',
														class: 'fixed inset-0 h-[100vh] w-[100vw] bg-black',
														child,
														$$slots: { child: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}
										} else {
											$$renderer.push('<!--[-1-->');

											{
												function child($$renderer, { props, open: _open }) {
													$$renderer.push(`<div${$.attributes({ ...props })}></div>`);
												}

												if (AlertDialog.Overlay) {
													$$renderer.push('<!--[-->');

													AlertDialog.Overlay($$renderer, {
														forceMount: true,
														'data-testid': 'overlay',
														class: 'fixed inset-0 h-[100vh] w-[100vw] bg-black',
														child,
														$$slots: { child: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}
										}

										$$renderer.push(`<!--]--> `);

										if (withOpenCheck) {
											$$renderer.push('<!--[0-->');

											{
												function child($$renderer, { props, open }) {
													if (open) {
														$$renderer.push(`<!--[0--><div${$.attributes({ ...props })}>`);

														if (AlertDialog.Title) {
															$$renderer.push('<!--[-->');

															AlertDialog.Title($$renderer, $.spread_props([
																titleProps,
																{
																	'data-testid': 'title',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->title`);
																	},
																	$$slots: { default: true }
																}
															]));

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (AlertDialog.Description) {
															$$renderer.push('<!--[-->');

															AlertDialog.Description($$renderer, $.spread_props([
																descriptionProps,
																{
																	'data-testid': 'description',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->description`);
																	},
																	$$slots: { default: true }
																}
															]));

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (AlertDialog.Cancel) {
															$$renderer.push('<!--[-->');

															AlertDialog.Cancel($$renderer, {
																'data-testid': 'cancel',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->cancel`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (AlertDialog.Action) {
															$$renderer.push('<!--[-->');

															AlertDialog.Action($$renderer, {
																'data-testid': 'action',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->action`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <button id="open-focus-override" data-testid="open-focus-override">open focus override</button></div>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												}

												if (AlertDialog.Content) {
													$$renderer.push('<!--[-->');

													AlertDialog.Content($$renderer, $.spread_props([
														{ forceMount: true },
														contentProps,
														{
															'data-testid': 'content',
															class: 'tranlate-x-[50%] fixed left-[50%] top-[50%] translate-y-[50%] bg-white p-1',
															child,
															$$slots: { child: true }
														}
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}
										} else {
											$$renderer.push('<!--[-1-->');

											{
												function child($$renderer, { props, open: _open }) {
													$$renderer.push(`<div${$.attributes({ ...props })}>`);

													if (AlertDialog.Title) {
														$$renderer.push('<!--[-->');

														AlertDialog.Title($$renderer, $.spread_props([
															titleProps,
															{
																'data-testid': 'title',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->title`);
																},
																$$slots: { default: true }
															}
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (AlertDialog.Description) {
														$$renderer.push('<!--[-->');

														AlertDialog.Description($$renderer, $.spread_props([
															descriptionProps,
															{
																'data-testid': 'description',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->description`);
																},
																$$slots: { default: true }
															}
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (AlertDialog.Cancel) {
														$$renderer.push('<!--[-->');

														AlertDialog.Cancel($$renderer, {
															'data-testid': 'cancel',
															children: ($$renderer) => {
																$$renderer.push(`<!---->cancel`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (AlertDialog.Action) {
														$$renderer.push('<!--[-->');

														AlertDialog.Action($$renderer, {
															'data-testid': 'action',
															children: ($$renderer) => {
																$$renderer.push(`<!---->action`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` <button id="open-focus-override" data-testid="open-focus-override">open focus override</button></div>`);
												}

												if (AlertDialog.Content) {
													$$renderer.push('<!--[-->');

													AlertDialog.Content($$renderer, $.spread_props([
														{ forceMount: true },
														contentProps,
														{
															'data-testid': 'content',
															class: 'tranlate-x-[50%] fixed left-[50%] top-[50%] translate-y-[50%] bg-white p-1',
															child,
															$$slots: { child: true }
														}
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <p data-testid="binding">${$.escape(open)}</p> <button data-testid="toggle">toggle</button> <button id="close-focus-override" data-testid="close-focus-override">close focus override</button> <div id="portalTarget" data-testid="portalTarget"></div></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}