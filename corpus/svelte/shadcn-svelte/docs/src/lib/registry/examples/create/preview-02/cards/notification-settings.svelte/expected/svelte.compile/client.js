import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Notification_settings($$anchor) {
	const NOTIFICATIONS = [
		{
			id: "transactions",
			label: "Transaction alerts",
			description: "Deposits, withdrawals, and transfers.",
			defaultChecked: true
		},

		{
			id: "security",
			label: "Security alerts",
			description: "Login attempts and account changes.",
			defaultChecked: true
		},

		{
			id: "goals",
			label: "Goal milestones",
			description: "Updates at 25%, 50%, 75%, and 100%.",
			defaultChecked: false
		},

		{
			id: "market",
			label: "Market updates",
			description: "Daily portfolio summary and price alerts.",
			defaultChecked: false
		}
	];

	let checkedMap = $.state($.proxy(Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultChecked]))));
	const allChecked = $.derived(() => NOTIFICATIONS.every((n) => $.get(checkedMap)[n.id]));
	const someChecked = $.derived(() => NOTIFICATIONS.some((n) => $.get(checkedMap)[n.id]) && !$.get(allChecked));

	function setAll(value) {
		$.set(checkedMap, Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, value])), true);
	}

	function setOne(id, value) {
		$.set(checkedMap, { ...$.get(checkedMap), [id]: value }, true);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
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

										var text = $.text('Notifications');

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

										var text_1 = $.text('Choose what you want to be notified about.');

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
										var fragment_4 = root();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													Checkbox(node_7, {
														id: 'notify-all',
														get checked() {
															return $.get(allChecked);
														},

														get indeterminate() {
															return $.get(someChecked);
														},
														onCheckedChange: (v) => setAll(!!v)
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Field.Content, ($$anchor, Field_Content) => {
														Field_Content($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_9 = $.first_child(fragment_6);

																$.component(node_9, () => Field.Label, ($$anchor, Field_Label) => {
																	Field_Label($$anchor, {
																		for: 'notify-all',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Select all');

																			$.append($$anchor, text_2);
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

										var node_10 = $.sibling(node_6, 2);

										$.each(node_10, 17, () => NOTIFICATIONS, (n) => n.id, ($$anchor, n) => {
											var fragment_7 = $.comment();
											var node_11 = $.first_child(fragment_7);

											$.component(node_11, () => Field.Field, ($$anchor, Field_Field_1) => {
												Field_Field_1($$anchor, {
													orientation: 'horizontal',
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root();
														var node_12 = $.first_child(fragment_8);

														{
															let $0 = $.derived(() => "notify-" + $.get(n).id);

															Checkbox(node_12, {
																get id() {
																	return $.get($0);
																},

																get checked() {
																	return $.get(checkedMap)[$.get(n).id];
																},
																onCheckedChange: (v) => setOne($.get(n).id, !!v)
															});
														}

														var node_13 = $.sibling(node_12, 2);

														$.component(node_13, () => Field.Content, ($$anchor, Field_Content_1) => {
															Field_Content_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = root();
																	var node_14 = $.first_child(fragment_9);

																	{
																		let $0 = $.derived(() => "notify-" + $.get(n).id);

																		$.component(node_14, () => Field.Label, ($$anchor, Field_Label_1) => {
																			Field_Label_1($$anchor, {
																				get for() {
																					return $.get($0);
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text();

																					$.template_effect(() => $.set_text(text_3, $.get(n).label));
																					$.append($$anchor, text_3);
																				},
																				$$slots: { default: true }
																			});
																		});
																	}

																	var node_15 = $.sibling(node_14, 2);

																	$.component(node_15, () => Field.Description, ($$anchor, Field_Description) => {
																		Field_Description($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_4 = $.text();

																				$.template_effect(() => $.set_text(text_4, $.get(n).description));
																				$.append($$anchor, text_4);
																			},
																			$$slots: { default: true }
																		});
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

											$.append($$anchor, fragment_7);
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

				var node_16 = $.sibling(node_4, 2);

				$.component(node_16, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Save Preferences');

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