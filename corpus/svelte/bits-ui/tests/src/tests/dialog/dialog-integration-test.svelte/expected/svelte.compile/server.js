import * as $ from 'svelte/internal/server';
import { Dialog } from "bits-ui";
import { DropdownMenu } from "bits-ui";
import { Popover } from "bits-ui";

export default function Dialog_integration_test($$renderer) {
	$$renderer.push(`<main>`);

	if (Dialog.Root) {
		$$renderer.push('<!--[-->');

		Dialog.Root($$renderer, {
			children: ($$renderer) => {
				if (Dialog.Trigger) {
					$$renderer.push('<!--[-->');

					Dialog.Trigger($$renderer, {
						'data-testid': 'dialog-trigger',
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

				if (Dialog.Portal) {
					$$renderer.push('<!--[-->');

					Dialog.Portal($$renderer, {
						children: ($$renderer) => {
							if (Dialog.Content) {
								$$renderer.push('<!--[-->');

								Dialog.Content($$renderer, {
									'data-testid': 'dialog-content',
									children: ($$renderer) => {
										if (DropdownMenu.Root) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Root($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Trigger) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Trigger($$renderer, {
															'data-testid': 'dropdown-trigger',
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

													if (DropdownMenu.Portal) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Portal($$renderer, {
															children: ($$renderer) => {
																if (DropdownMenu.Content) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Content($$renderer, {
																		'data-testid': 'dropdown-content',
																		children: ($$renderer) => {
																			if (DropdownMenu.Item) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Item($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->item`);
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

										if (Popover.Root) {
											$$renderer.push('<!--[-->');

											Popover.Root($$renderer, {
												children: ($$renderer) => {
													if (Popover.Trigger) {
														$$renderer.push('<!--[-->');

														Popover.Trigger($$renderer, {
															'data-testid': 'popover-trigger',
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

													if (Popover.Portal) {
														$$renderer.push('<!--[-->');

														Popover.Portal($$renderer, {
															children: ($$renderer) => {
																if (Popover.Content) {
																	$$renderer.push('<!--[-->');

																	Popover.Content($$renderer, {
																		'data-testid': 'popover-content',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->content`);
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

										$$renderer.push(` content`);
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

	$$renderer.push(`</main>`);
}