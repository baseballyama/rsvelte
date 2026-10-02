import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Social_links($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Social Links');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_6 = $.first_child(fragment_5);

													$.component(node_6, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'spotify-url',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Spotify Artist URL');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
														InputGroup_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_8 = $.first_child(fragment_6);

																$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																	InputGroup_Addon($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			IconPlaceholder($$anchor, {
																				lucide: 'CirclePlusIcon',
																				tabler: 'IconCirclePlus',
																				hugeicons: 'PlusSignCircleIcon',
																				phosphor: 'PlusCircleIcon',
																				remixicon: 'RiAddCircleLine'
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																var node_9 = $.sibling(node_8, 2);

																$.component(node_9, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																	InputGroup_Input($$anchor, { id: 'spotify-url', value: 'spotify.com/artist/3j...2k' });
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_5, 2);

										$.component(node_10, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root();
													var node_11 = $.first_child(fragment_8);

													$.component(node_11, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'instagram-handle',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Instagram Handle');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_12 = $.sibling(node_11, 2);

													$.component(node_12, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
														InputGroup_Root_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root();
																var node_13 = $.first_child(fragment_9);

																$.component(node_13, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
																	InputGroup_Addon_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			IconPlaceholder($$anchor, {
																				lucide: 'CameraIcon',
																				tabler: 'IconCamera',
																				hugeicons: 'Camera01Icon',
																				phosphor: 'CameraIcon',
																				remixicon: 'RiCameraLine'
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																var node_14 = $.sibling(node_13, 2);

																$.component(node_14, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
																	InputGroup_Input_1($$anchor, { id: 'instagram-handle', value: '@julianduryea_music' });
																});

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_10, 2);

										$.component(node_15, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root();
													var node_16 = $.first_child(fragment_11);

													$.component(node_16, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'soundcloud-url',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('SoundCloud URL');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_17 = $.sibling(node_16, 2);

													$.component(node_17, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
														InputGroup_Root_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = root();
																var node_18 = $.first_child(fragment_12);

																$.component(node_18, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
																	InputGroup_Addon_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			IconPlaceholder($$anchor, {
																				lucide: 'CloudIcon',
																				tabler: 'IconCloud',
																				hugeicons: 'CloudUploadIcon',
																				phosphor: 'CloudIcon',
																				remixicon: 'RiCloudLine'
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																var node_19 = $.sibling(node_18, 2);

																$.component(node_19, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
																	InputGroup_Input_2($$anchor, { id: 'soundcloud-url', placeholder: 'soundcloud.com/username' });
																});

																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										var node_20 = $.sibling(node_15, 2);

										$.component(node_20, () => Field.Field, ($$anchor, Field_Field_3) => {
											Field_Field_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root();
													var node_21 = $.first_child(fragment_14);

													$.component(node_21, () => Field.Label, ($$anchor, Field_Label_3) => {
														Field_Label_3($$anchor, {
															for: 'website-url',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Website');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_22 = $.sibling(node_21, 2);

													$.component(node_22, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
														InputGroup_Root_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = root();
																var node_23 = $.first_child(fragment_15);

																$.component(node_23, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
																	InputGroup_Addon_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			IconPlaceholder($$anchor, {
																				lucide: 'GlobeIcon',
																				tabler: 'IconWorld',
																				hugeicons: 'Globe02Icon',
																				phosphor: 'GlobeIcon',
																				remixicon: 'RiGlobalLine'
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																var node_24 = $.sibling(node_23, 2);

																$.component(node_24, () => InputGroup.Input, ($$anchor, InputGroup_Input_3) => {
																	InputGroup_Input_3($$anchor, { id: 'website-url', placeholder: 'https://yoursite.com' });
																});

																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_25 = $.sibling(node_3, 2);

				$.component(node_25, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'justify-end gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_17 = root();
							var node_26 = $.first_child(fragment_17);

							Button(node_26, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Discard');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_27 = $.sibling(node_26, 2);

							Button(node_27, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Save Changes');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}