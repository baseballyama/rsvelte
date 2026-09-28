import * as $ from 'svelte/internal/server';
import * as AlertDialog from '$lib/components/ui/alert-dialog';
import { Button } from '$lib/components/ui/button';
import * as Accordion from '$lib/components/ui/accordion';
import { TriangleAlert } from '@lucide/svelte';

export default function ExtensionInstallConfirm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { violations, open = void 0, onconfirm, oncancel } = $$props;
		const isTruncated = $.derived(() => violations.length > 3);
		const truncatedViolations = $.derived(() => violations.slice(0, 3));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					onOpenChange: (isOpen) => !isOpen && oncancel(),
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex flex-col items-center gap-2 text-center">`);
												TriangleAlert($$renderer, { class: 'size-12 text-yellow-400' });
												$$renderer.push(`<!----> `);

												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Potential Incompatibility Detected`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</div> `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														class: 'text-center',
														children: ($$renderer) => {
															$$renderer.push(`<!---->This extension may not work as expected on your system. We recommend proceeding with
				caution. `);

															if (Accordion.Root) {
																$$renderer.push('<!--[-->');

																Accordion.Root($$renderer, {
																	class: 'w-full pt-4',
																	type: 'multiple',
																	children: ($$renderer) => {
																		if (Accordion.Item) {
																			$$renderer.push('<!--[-->');

																			Accordion.Item($$renderer, {
																				value: 'details',
																				children: ($$renderer) => {
																					if (Accordion.Trigger) {
																						$$renderer.push('<!--[-->');

																						Accordion.Trigger($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Technical Details`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (Accordion.Content) {
																						$$renderer.push('<!--[-->');

																						Accordion.Content($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<ul class="list-disc space-y-2 pl-5 text-left text-xs"><!--[-->`);

																								const each_array = $.ensure_array_like(truncatedViolations());

																								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																									let violation = each_array[$$index];

																									$$renderer.push(`<li><strong>${$.escape(violation.commandName)}:</strong> ${$.escape(violation.reason)}</li>`);
																								}

																								$$renderer.push(`<!--]--> `);

																								if (isTruncated()) {
																									$$renderer.push(`<!--[0--><li>... ${$.escape(violations.length - 3)} more warnings</li>`);
																								} else {
																									$$renderer.push('<!--[-1-->');
																								}

																								$$renderer.push(`<!--]--></ul>`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														onclick: () => oncancel(),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															props,
															{
																onclick: () => onconfirm(),
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Install anyway`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (AlertDialog.Action) {
														$$renderer.push('<!--[-->');
														AlertDialog.Action($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}