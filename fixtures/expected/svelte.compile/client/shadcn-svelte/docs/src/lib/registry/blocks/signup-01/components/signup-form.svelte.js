import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Already have an account? <a href="#/">Sign in</a>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<form><!></form>`);

export default function Signup_form($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, $.spread_props(() => restProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
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

										var text = $.text('Create an account');

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

										var text_1 = $.text('Enter your information below to create your account');

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
							var form = root_4();
							var node_5 = $.child(form);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_3();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_7 = $.first_child(fragment_4);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'name',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Full Name');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													Input(node_8, {
														id: 'name',
														type: 'text',
														placeholder: 'John Doe',
														required: true
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_6, 2);

										$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_10 = $.first_child(fragment_5);

													$.component(node_10, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'email',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Email');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													Input(node_11, {
														id: 'email',
														type: 'email',
														placeholder: 'm@example.com',
														required: true
													});

													var node_12 = $.sibling(node_11, 2);

													$.component(node_12, () => Field.Description, ($$anchor, Field_Description) => {
														Field_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('We\'ll use this to contact you. We will not share your email with anyone else.');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_9, 2);

										$.component(node_13, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var node_14 = $.first_child(fragment_6);

													$.component(node_14, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'password',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Password');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_15 = $.sibling(node_14, 2);

													Input(node_15, { id: 'password', type: 'password', required: true });

													var node_16 = $.sibling(node_15, 2);

													$.component(node_16, () => Field.Description, ($$anchor, Field_Description_1) => {
														Field_Description_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Must be at least 8 characters long.');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_13, 2);

										$.component(node_17, () => Field.Field, ($$anchor, Field_Field_3) => {
											Field_Field_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_1();
													var node_18 = $.first_child(fragment_7);

													$.component(node_18, () => Field.Label, ($$anchor, Field_Label_3) => {
														Field_Label_3($$anchor, {
															for: 'confirm-password',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Confirm Password');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_18, 2);

													Input(node_19, { id: 'confirm-password', type: 'password', required: true });

													var node_20 = $.sibling(node_19, 2);

													$.component(node_20, () => Field.Description, ($$anchor, Field_Description_2) => {
														Field_Description_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('Please confirm your password.');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_17, 2);

										$.component(node_21, () => Field.Group, ($$anchor, Field_Group_1) => {
											Field_Group_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = $.comment();
													var node_22 = $.first_child(fragment_8);

													$.component(node_22, () => Field.Field, ($$anchor, Field_Field_4) => {
														Field_Field_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root_1();
																var node_23 = $.first_child(fragment_9);

																Button(node_23, {
																	type: 'submit',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('Create Account');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});

																var node_24 = $.sibling(node_23, 2);

																Button(node_24, {
																	variant: 'outline',
																	type: 'button',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('Sign up with Google');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});

																var node_25 = $.sibling(node_24, 2);

																$.component(node_25, () => Field.Description, ($$anchor, Field_Description_3) => {
																	Field_Description_3($$anchor, {
																		class: 'px-6 text-center',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var fragment_10 = root_2();

																			$.next();
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

													$.append($$anchor, fragment_8);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
}