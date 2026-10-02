import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Social_links($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Social Links`);
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
							if (Field.Group) {
								$$renderer.push('<!--[-->');

								Field.Group($$renderer, {
									children: ($$renderer) => {
										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'spotify-url',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Spotify Artist URL`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (InputGroup.Root) {
														$$renderer.push('<!--[-->');

														InputGroup.Root($$renderer, {
															children: ($$renderer) => {
																if (InputGroup.Addon) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Addon($$renderer, {
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'CirclePlusIcon',
																				tabler: 'IconCirclePlus',
																				hugeicons: 'PlusSignCircleIcon',
																				phosphor: 'PlusCircleIcon',
																				remixicon: 'RiAddCircleLine'
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

																if (InputGroup.Input) {
																	$$renderer.push('<!--[-->');
																	InputGroup.Input($$renderer, { id: 'spotify-url', value: 'spotify.com/artist/3j...2k' });
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

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'instagram-handle',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Instagram Handle`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (InputGroup.Root) {
														$$renderer.push('<!--[-->');

														InputGroup.Root($$renderer, {
															children: ($$renderer) => {
																if (InputGroup.Addon) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Addon($$renderer, {
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'CameraIcon',
																				tabler: 'IconCamera',
																				hugeicons: 'Camera01Icon',
																				phosphor: 'CameraIcon',
																				remixicon: 'RiCameraLine'
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

																if (InputGroup.Input) {
																	$$renderer.push('<!--[-->');
																	InputGroup.Input($$renderer, { id: 'instagram-handle', value: '@julianduryea_music' });
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

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'soundcloud-url',
															children: ($$renderer) => {
																$$renderer.push(`<!---->SoundCloud URL`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (InputGroup.Root) {
														$$renderer.push('<!--[-->');

														InputGroup.Root($$renderer, {
															children: ($$renderer) => {
																if (InputGroup.Addon) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Addon($$renderer, {
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'CloudIcon',
																				tabler: 'IconCloud',
																				hugeicons: 'CloudUploadIcon',
																				phosphor: 'CloudIcon',
																				remixicon: 'RiCloudLine'
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

																if (InputGroup.Input) {
																	$$renderer.push('<!--[-->');
																	InputGroup.Input($$renderer, { id: 'soundcloud-url', placeholder: 'soundcloud.com/username' });
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

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'website-url',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Website`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (InputGroup.Root) {
														$$renderer.push('<!--[-->');

														InputGroup.Root($$renderer, {
															children: ($$renderer) => {
																if (InputGroup.Addon) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Addon($$renderer, {
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'GlobeIcon',
																				tabler: 'IconWorld',
																				hugeicons: 'Globe02Icon',
																				phosphor: 'GlobeIcon',
																				remixicon: 'RiGlobalLine'
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

																if (InputGroup.Input) {
																	$$renderer.push('<!--[-->');
																	InputGroup.Input($$renderer, { id: 'website-url', placeholder: 'https://yoursite.com' });
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

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						class: 'justify-end gap-2',
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Discard`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Save Changes`);
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
}