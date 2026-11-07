import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form id="contributions-activity"><!></form>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Contributions_activity($$anchor) {
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
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

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

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var form = root_1();
							var node_5 = $.child(form);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Field.Set, ($$anchor, Field_Set) => {
											Field_Set($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_7 = $.first_child(fragment_4);

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
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_9 = $.first_child(fragment_5);

																$.component(node_9, () => Field.Field, ($$anchor, Field_Field) => {
																	Field_Field($$anchor, {
																		orientation: 'horizontal',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root();
																			var node_10 = $.first_child(fragment_6);

																			Checkbox(node_10, { id: 'activity-private-profile' });

																			var node_11 = $.sibling(node_10, 2);

																			$.component(node_11, () => Field.Content, ($$anchor, Field_Content) => {
																				Field_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_7 = root();
																						var node_12 = $.first_child(fragment_7);

																						$.component(node_12, () => Field.Label, ($$anchor, Field_Label) => {
																							Field_Label($$anchor, {
																								for: 'activity-private-profile',
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

																									var text_4 = $.text('Enabling this will hide your contributions and activity from your GitHub profile\n									and from social features like followers, stars, feeds, leaderboards and releases.');

																									$.append($$anchor, text_4);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_7);
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

										$.append($$anchor, fragment_3);
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

				var node_14 = $.sibling(node_4, 2);

				$.component(node_14, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								form: 'contributions-activity',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Save Changes');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
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