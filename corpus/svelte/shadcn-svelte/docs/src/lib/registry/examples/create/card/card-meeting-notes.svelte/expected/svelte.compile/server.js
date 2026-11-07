import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Card_meeting_notes($$renderer) {
	Example($$renderer, {
		title: 'Meeting Notes',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'mx-auto w-full max-w-sm',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Meeting Notes`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Description) {
										$$renderer.push('<!--[-->');

										Card.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Transcript from the meeting with the client.`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Action) {
										$$renderer.push('<!--[-->');

										Card.Action($$renderer, {
											children: ($$renderer) => {
												if (Button.Root) {
													$$renderer.push('<!--[-->');

													Button.Root($$renderer, {
														variant: 'outline',
														size: 'sm',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'CaptionsIcon',
																tabler: 'IconTextCaption',
																hugeicons: 'TextCheckIcon',
																phosphor: 'TextTIcon',
																remixicon: 'RiClosedCaptioningLine'
															});

															$$renderer.push(`<!----> Transcribe`);
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

						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p>Client requested dashboard redesign with focus on mobile responsiveness.</p> <ol class="mt-4 flex list-decimal flex-col gap-2 pl-6"><li>New analytics widgets for daily/weekly metrics</li> <li>Simplified navigation menu</li> <li>Dark mode support</li> <li>Timeline: 6 weeks</li> <li>Follow-up meeting scheduled for next Tuesday</li></ol>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								children: ($$renderer) => {
									if (Avatar.Group) {
										$$renderer.push('<!--[-->');

										Avatar.Group($$renderer, {
											children: ($$renderer) => {
												if (Avatar.Root) {
													$$renderer.push('<!--[-->');

													Avatar.Root($$renderer, {
														children: ($$renderer) => {
															if (Avatar.Image) {
																$$renderer.push('<!--[-->');
																Avatar.Image($$renderer, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Avatar.Fallback) {
																$$renderer.push('<!--[-->');

																Avatar.Fallback($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->CN`);
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

												if (Avatar.Root) {
													$$renderer.push('<!--[-->');

													Avatar.Root($$renderer, {
														children: ($$renderer) => {
															if (Avatar.Image) {
																$$renderer.push('<!--[-->');
																Avatar.Image($$renderer, { src: 'https://github.com/maxleiter.png', alt: '@maxleiter' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Avatar.Fallback) {
																$$renderer.push('<!--[-->');

																Avatar.Fallback($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->LR`);
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

												if (Avatar.Root) {
													$$renderer.push('<!--[-->');

													Avatar.Root($$renderer, {
														children: ($$renderer) => {
															if (Avatar.Image) {
																$$renderer.push('<!--[-->');
																Avatar.Image($$renderer, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Avatar.Fallback) {
																$$renderer.push('<!--[-->');

																Avatar.Fallback($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->ER`);
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

												if (Avatar.GroupCount) {
													$$renderer.push('<!--[-->');

													Avatar.GroupCount($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->+8`);
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
}