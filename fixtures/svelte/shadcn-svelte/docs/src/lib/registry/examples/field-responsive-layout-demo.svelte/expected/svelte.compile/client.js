import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="w-full max-w-4xl"><form><!></form></div>`);

export default function Field_responsive_layout_demo($$anchor) {
	var div = root_3();
	var form = $.child(div);
	var node = $.child(form);

	$.component(node, () => Field.Set, ($$anchor, Field_Set) => {
		Field_Set($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Legend, ($$anchor, Field_Legend) => {
					Field_Legend($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Profile');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Field.Description, ($$anchor, Field_Description) => {
					Field_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Fill in your profile information.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Field.Separator, ($$anchor, Field_Separator) => {
					Field_Separator($$anchor, {});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => Field.Group, ($$anchor, Field_Group) => {
					Field_Group($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_5 = $.first_child(fragment_1);

							$.component(node_5, () => Field.Field, ($$anchor, Field_Field) => {
								Field_Field($$anchor, {
									orientation: 'responsive',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_6 = $.first_child(fragment_2);

										$.component(node_6, () => Field.Content, ($$anchor, Field_Content) => {
											Field_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_7 = $.first_child(fragment_3);

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

													$.component(node_8, () => Field.Description, ($$anchor, Field_Description_1) => {
														Field_Description_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Provide your full name for identification');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_6, 2);

										Input(node_9, { id: 'name', placeholder: 'Evil Rabbit', required: true });
										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_5, 2);

							$.component(node_10, () => Field.Separator, ($$anchor, Field_Separator_1) => {
								Field_Separator_1($$anchor, {});
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Field.Field, ($$anchor, Field_Field_1) => {
								Field_Field_1($$anchor, {
									orientation: 'responsive',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_12 = $.first_child(fragment_4);

										$.component(node_12, () => Field.Content, ($$anchor, Field_Content_1) => {
											Field_Content_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_13 = $.first_child(fragment_5);

													$.component(node_13, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'message',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Message');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => Field.Description, ($$anchor, Field_Description_2) => {
														Field_Description_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('You can write your message here. Keep it short, preferably under 100 characters.');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_12, 2);

										Textarea(node_15, {
											id: 'message',
											placeholder: 'Hello, world!',
											required: true,
											class: 'min-h-[100px] resize-none sm:min-w-[300px]'
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_16 = $.sibling(node_11, 2);

							$.component(node_16, () => Field.Separator, ($$anchor, Field_Separator_2) => {
								Field_Separator_2($$anchor, {});
							});

							var node_17 = $.sibling(node_16, 2);

							$.component(node_17, () => Field.Field, ($$anchor, Field_Field_2) => {
								Field_Field_2($$anchor, {
									orientation: 'responsive',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_18 = $.first_child(fragment_6);

										Button(node_18, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Submit');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});

										var node_19 = $.sibling(node_18, 2);

										Button(node_19, {
											type: 'button',
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Cancel');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_6);
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(form);
	$.reset(div);
	$.append($$anchor, div);
}