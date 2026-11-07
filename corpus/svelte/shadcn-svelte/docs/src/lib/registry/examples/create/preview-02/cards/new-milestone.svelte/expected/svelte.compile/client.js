import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid grid-cols-2 gap-3"><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function New_milestone($$anchor) {
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

										var text = $.text('Set a new milestone');

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

										var text_1 = $.text('Define your financial target and we\'ll help you pace your savings.');

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
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'goal-name',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Goal Name');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													Input(node_8, {
														id: 'goal-name',
														placeholder: 'e.g. New Car, Home Downpayment'
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var div = $.sibling(node_6, 2);
										var node_9 = $.child(div);

										$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_10 = $.first_child(fragment_6);

													$.component(node_10, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'target-amount',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Target Amount');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													Input(node_11, { id: 'target-amount', value: '$15,000' });
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_9, 2);

										$.component(node_12, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_13 = $.first_child(fragment_7);

													$.component(node_13, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'target-date',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Target Date');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_14 = $.sibling(node_13, 2);

													Input(node_14, { id: 'target-date', value: 'Dec 2025' });
													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div);
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

				var node_15 = $.sibling(node_4, 2);

				$.component(node_15, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_16 = $.first_child(fragment_8);

							Button(node_16, {
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Create Goal');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_17 = $.sibling(node_16, 2);

							Button(node_17, {
								variant: 'outline',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Cancel');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
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