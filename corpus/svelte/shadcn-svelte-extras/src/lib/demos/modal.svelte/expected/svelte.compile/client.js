import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Modal from '$lib/components/ui/modal';
import Button from '$lib/components/button.svelte';
import { buttonVariants } from '$lib/components/ui/button';
import { Label } from '$lib/components/ui/label';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Modal_1($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Modal.Root, ($$anchor, Modal_Root) => {
		Modal_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: 'outline' }));

					$.component(node_1, () => Modal.Trigger, ($$anchor, Modal_Trigger) => {
						Modal_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Edit Profile');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Modal.Content, ($$anchor, Modal_Content) => {
					Modal_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Modal.Header, ($$anchor, Modal_Header) => {
								Modal_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Modal.Title, ($$anchor, Modal_Title) => {
											Modal_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Edit Profile');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Modal.Description, ($$anchor, Modal_Description) => {
											Modal_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Make changes to your profile here. Click save when you\'re done.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_3, 2);

							$.component(node_6, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_7 = $.first_child(fragment_4);

										$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_8 = $.first_child(fragment_5);

													Label(node_8, {
														for: 'name',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Name');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});

													var node_9 = $.sibling(node_8, 2);

													Input(node_9, { id: 'name', value: 'Pedro Duarte' });
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_7, 2);

										$.component(node_10, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_11 = $.first_child(fragment_6);

													Label(node_11, {
														for: 'username',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Username');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});

													var node_12 = $.sibling(node_11, 2);

													Input(node_12, { id: 'username', value: '@peduarte' });
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_6, 2);

							$.component(node_13, () => Modal.Footer, ($$anchor, Modal_Footer) => {
								Modal_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
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

							$.append($$anchor, fragment_2);
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
	$.pop();
}