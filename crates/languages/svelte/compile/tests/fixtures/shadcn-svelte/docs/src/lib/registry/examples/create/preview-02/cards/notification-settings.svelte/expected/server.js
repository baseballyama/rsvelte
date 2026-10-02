import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

export default function Notification_settings($$renderer) {
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

	let checkedMap = Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultChecked]));
	const allChecked = $.derived(() => NOTIFICATIONS.every((n) => checkedMap[n.id]));
	const someChecked = $.derived(() => NOTIFICATIONS.some((n) => checkedMap[n.id]) && !allChecked());

	function setAll(value) {
		checkedMap = Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, value]));
	}

	function setOne(id, value) {
		checkedMap = { ...checkedMap, [id]: value };
	}

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
										$$renderer.push(`<!---->Notifications`);
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
										$$renderer.push(`<!---->Choose what you want to be notified about.`);
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
												orientation: 'horizontal',
												children: ($$renderer) => {
													Checkbox($$renderer, {
														id: 'notify-all',
														checked: allChecked(),
														indeterminate: someChecked(),
														onCheckedChange: (v) => setAll(!!v)
													});

													$$renderer.push(`<!----> `);

													if (Field.Content) {
														$$renderer.push('<!--[-->');

														Field.Content($$renderer, {
															children: ($$renderer) => {
																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: 'notify-all',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Select all`);
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

										$$renderer.push(` <!--[-->`);

										const each_array = $.ensure_array_like(NOTIFICATIONS);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let n = each_array[$$index];

											if (Field.Field) {
												$$renderer.push('<!--[-->');

												Field.Field($$renderer, {
													orientation: 'horizontal',
													children: ($$renderer) => {
														Checkbox($$renderer, {
															id: "notify-" + n.id,
															checked: checkedMap[n.id],
															onCheckedChange: (v) => setOne(n.id, !!v)
														});

														$$renderer.push(`<!----> `);

														if (Field.Content) {
															$$renderer.push('<!--[-->');

															Field.Content($$renderer, {
																children: ($$renderer) => {
																	if (Field.Label) {
																		$$renderer.push('<!--[-->');

																		Field.Label($$renderer, {
																			for: "notify-" + n.id,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(n.label)}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Field.Description) {
																		$$renderer.push('<!--[-->');

																		Field.Description($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(n.description)}`);
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

										$$renderer.push(`<!--]-->`);
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
						children: ($$renderer) => {
							Button($$renderer, {
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Save Preferences`);
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
}