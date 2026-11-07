import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Card, CardContent } from "$lib/registry/ui/card/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<form><!></form>`);

export default function Field_hear($$anchor) {
	const options = [
		{ label: "Social Media", value: "social-media" },
		{ label: "Search Engine", value: "search-engine" },
		{ label: "Referral", value: "referral" },
		{ label: "Other", value: "other" }
	];

	Card($$anchor, {
		class: 'py-4 shadow-none',
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				class: 'px-4',
				children: ($$anchor, $$slotProps) => {
					var form = root_2();
					var node = $.child(form);

					$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
						Field_Group($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_1 = $.first_child(fragment_2);

								$.component(node_1, () => Field.Set, ($$anchor, Field_Set) => {
									Field_Set($$anchor, {
										class: 'gap-4',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_1();
											var node_2 = $.first_child(fragment_3);

											$.component(node_2, () => Field.Legend, ($$anchor, Field_Legend) => {
												Field_Legend($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('How did you hear about us?');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_3 = $.sibling(node_2, 2);

											$.component(node_3, () => Field.Description, ($$anchor, Field_Description) => {
												Field_Description($$anchor, {
													class: 'line-clamp-1',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Select the option that best describes how you heard about us.');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => Field.Group, ($$anchor, Field_Group_1) => {
												Field_Group_1($$anchor, {
													class: 'flex flex-row flex-wrap gap-2 [--radius:9999rem]',
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_5 = $.first_child(fragment_4);

														$.each(node_5, 17, () => options, (option) => option.value, ($$anchor, option) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	get for() {
																		return $.get(option).value;
																	},
																	class: '!w-fit',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = $.comment();
																		var node_7 = $.first_child(fragment_6);

																		$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
																			Field_Field($$anchor, {
																				orientation: 'horizontal',
																				class: 'gap-1.5 overflow-hidden !px-3 !py-1.5 transition-all duration-100 ease-linear group-has-data-[state=checked]/field-label:!px-2',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_7 = root();
																					var node_8 = $.first_child(fragment_7);

																					{
																						let $0 = $.derived(() => $.get(option).value === "social-media");

																						Checkbox(node_8, {
																							get value() {
																								return $.get(option).value;
																							},

																							get id() {
																								return $.get(option).value;
																							},

																							get checked() {
																								return $.get($0);
																							},
																							class: '-ms-6 -translate-x-1 rounded-full transition-all duration-100 ease-linear data-[state=checked]:ms-0 data-[state=checked]:translate-x-0'
																						});
																					}

																					var node_9 = $.sibling(node_8, 2);

																					$.component(node_9, () => Field.Title, ($$anchor, Field_Title) => {
																						Field_Title($$anchor, {
																							class: 'text-nowrap',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_2 = $.text();

																								$.template_effect(() => $.set_text(text_2, $.get(option).label));
																								$.append($$anchor, text_2);
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

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.reset(form);
					$.append($$anchor, form);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}