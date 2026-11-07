import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Popover_with_form($$anchor) {
	Example($$anchor, {
		title: 'With Form',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Open Popover');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
								Popover_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'w-64',
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Popover.Header, ($$anchor, Popover_Header) => {
										Popover_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Popover.Title, ($$anchor, Popover_Title) => {
													Popover_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Dimensions');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Popover.Description, ($$anchor, Popover_Description) => {
													Popover_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Set the dimensions for the layer.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_3, 2);

									$.component(node_6, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											class: 'gap-4',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_8 = $.first_child(fragment_7);

															$.component(node_8, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'width',
																	class: 'w-1/2',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Width');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															Input(node_9, { id: 'width', value: '100%' });
															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_7, 2);

												$.component(node_10, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_11 = $.first_child(fragment_8);

															$.component(node_11, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'height',
																	class: 'w-1/2',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Height');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_11, 2);

															Input(node_12, { id: 'height', value: '25px' });
															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

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