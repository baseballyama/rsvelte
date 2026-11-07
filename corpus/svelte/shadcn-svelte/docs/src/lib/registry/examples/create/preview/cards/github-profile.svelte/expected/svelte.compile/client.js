import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`You can manage verified email addresses in your <a href="https://github.com/settings/emails" class="underline">email settings</a>.`, 1);
var root_3 = $.from_html(`You can <span>@mention</span> other users and organizations to link to them.`, 1);
var root_4 = $.from_html(`<form id="profile"><!></form>`);

export default function Github_profile($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'mx-auto w-full max-w-md',
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

										var text = $.text('Profile');

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

										var text_1 = $.text('Manage your profile information.');

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
										var fragment_3 = root_1();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_7 = $.first_child(fragment_4);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'name',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Name');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													Input(node_8, { id: 'name', placeholder: 'shadcn' });

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Field.Description, ($$anchor, Field_Description) => {
														Field_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Your name may appear around GitHub where you contribute or are mentioned. You can remove\n						it at any time.');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_6, 2);

										$.component(node_10, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_11 = $.first_child(fragment_5);

													$.component(node_11, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'email',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Public Email');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_12 = $.sibling(node_11, 2);

													$.component(node_12, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
														NativeSelect_Root($$anchor, {
															id: 'email',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_13 = $.first_child(fragment_6);

																$.component(node_13, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
																	NativeSelect_Option($$anchor, {
																		value: 'm@shadcn.com',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('m@shadcn.com');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_14 = $.sibling(node_13, 2);

																$.component(node_14, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
																	NativeSelect_Option_1($$anchor, {
																		value: 'm@gmail.com',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('m@gmail.com');

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

													var node_15 = $.sibling(node_12, 2);

													$.component(node_15, () => Field.Description, ($$anchor, Field_Description_1) => {
														Field_Description_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_7 = root_2();

																$.next(2);
																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_10, 2);

										$.component(node_16, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_1();
													var node_17 = $.first_child(fragment_8);

													$.component(node_17, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'bio',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Bio');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_18 = $.sibling(node_17, 2);

													Textarea(node_18, {
														id: 'bio',
														placeholder: 'Tell us a little bit about yourself'
													});

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => Field.Description, ($$anchor, Field_Description_2) => {
														Field_Description_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_9 = root_3();

																$.next(2);
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

				var node_20 = $.sibling(node_4, 2);

				$.component(node_20, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								form: 'profile',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Save Profile');

									$.append($$anchor, text_8);
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