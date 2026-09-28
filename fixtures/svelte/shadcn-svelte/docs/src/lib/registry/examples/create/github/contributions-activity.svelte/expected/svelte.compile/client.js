import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(
	`Your contribution graph, achievements, and activity overview will show your
										private contributions without revealing any repository or organization
										information. <a href="#read-more">Read more</a>.`,
	1
);

var root_2 = $.from_html(`<form id="contributions-activity"><!></form>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Contributions_activity($$anchor) {
	Example($$anchor, {
		title: 'Contributions Activity',
		class: 'justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-full max-w-md',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Contributions & Activity');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Manage your contributions and activity visibility.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var form = root_2();
									var node_5 = $.child(form);

									$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_6 = $.first_child(fragment_4);

												$.component(node_6, () => Field.Set, ($$anchor, Field_Set) => {
													Field_Set($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_7 = $.first_child(fragment_5);

															$.component(node_7, () => Field.Legend, ($$anchor, Field_Legend) => {
																Field_Legend($$anchor, {
																	class: 'sr-only',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Contributions & activity');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => Field.Group, ($$anchor, Field_Group_1) => {
																Field_Group_1($$anchor, {
																	class: 'gap-3',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root();
																		var node_9 = $.first_child(fragment_6);

																		$.component(node_9, () => Field.Field, ($$anchor, Field_Field) => {
																			Field_Field($$anchor, {
																				orientation: 'horizontal',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_7 = root();
																					var node_10 = $.first_child(fragment_7);

																					Checkbox(node_10, { id: 'private-profile' });

																					var node_11 = $.sibling(node_10, 2);

																					$.component(node_11, () => Field.Content, ($$anchor, Field_Content) => {
																						Field_Content($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_8 = root();
																								var node_12 = $.first_child(fragment_8);

																								$.component(node_12, () => Field.Label, ($$anchor, Field_Label) => {
																									Field_Label($$anchor, {
																										for: 'private-profile',
																										class: 'font-normal',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_3 = $.text('Make profile private and hide activity');

																											$.append($$anchor, text_3);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_13 = $.sibling(node_12, 2);

																								$.component(node_13, () => Field.Description, ($$anchor, Field_Description) => {
																									Field_Description($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_4 = $.text('Enabling this will hide your contributions and activity from your GitHub profile\n										and from social features like followers, stars, feeds, leaderboards and\n										releases.');

																											$.append($$anchor, text_4);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_8);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_14 = $.sibling(node_9, 2);

																		$.component(node_14, () => Field.Field, ($$anchor, Field_Field_1) => {
																			Field_Field_1($$anchor, {
																				orientation: 'horizontal',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root();
																					var node_15 = $.first_child(fragment_9);

																					Checkbox(node_15, { id: 'private-contributions', checked: true });

																					var node_16 = $.sibling(node_15, 2);

																					$.component(node_16, () => Field.Content, ($$anchor, Field_Content_1) => {
																						Field_Content_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_10 = root();
																								var node_17 = $.first_child(fragment_10);

																								$.component(node_17, () => Field.Label, ($$anchor, Field_Label_1) => {
																									Field_Label_1($$anchor, {
																										for: 'private-contributions',
																										class: 'font-normal',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_5 = $.text('Include private contributions on my profile');

																											$.append($$anchor, text_5);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_18 = $.sibling(node_17, 2);

																								$.component(node_18, () => Field.Description, ($$anchor, Field_Description_1) => {
																									Field_Description_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var fragment_11 = root_1();

																											$.next(2);
																											$.append($$anchor, fragment_11);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_10);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_9);
																				},
																				$$slots: { default: true }
																			});
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

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.reset(form);
									$.append($$anchor, form);
								},
								$$slots: { default: true }
							});
						});

						var node_19 = $.sibling(node_4, 2);

						$.component(node_19, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										form: 'contributions-activity',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Save Changes');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}