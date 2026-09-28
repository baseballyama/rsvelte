import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Kbd } from "$lib/registry/ui/kbd/index.js";

export default function Not_found($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							if (Empty.Root) {
								$$renderer.push('<!--[-->');

								Empty.Root($$renderer, {
									class: 'h-72',
									children: ($$renderer) => {
										if (Empty.Header) {
											$$renderer.push('<!--[-->');

											Empty.Header($$renderer, {
												children: ($$renderer) => {
													if (Empty.Title) {
														$$renderer.push('<!--[-->');

														Empty.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->404 - Not Found`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Empty.Description) {
														$$renderer.push('<!--[-->');

														Empty.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->The page you're looking for doesn't exist. Try searching for what you need below.`);
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

										if (Empty.Content) {
											$$renderer.push('<!--[-->');

											Empty.Content($$renderer, {
												children: ($$renderer) => {
													if (InputGroup.Root) {
														$$renderer.push('<!--[-->');

														InputGroup.Root($$renderer, {
															class: 'w-3/4',
															children: ($$renderer) => {
																if (InputGroup.Input) {
																	$$renderer.push('<!--[-->');
																	InputGroup.Input($$renderer, { placeholder: 'Try searching for pages...' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (InputGroup.Addon) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Addon($$renderer, {
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'SearchIcon',
																				tabler: 'IconSearch',
																				hugeicons: 'Search01Icon',
																				phosphor: 'MagnifyingGlassIcon',
																				remixicon: 'RiSearchLine'
																			});
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (InputGroup.Addon) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Addon($$renderer, {
																		align: 'inline-end',
																		children: ($$renderer) => {
																			Kbd($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->/`);
																				},
																				$$slots: { default: true }
																			});
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

													Button($$renderer, {
														variant: 'link',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Go to homepage`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
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
}