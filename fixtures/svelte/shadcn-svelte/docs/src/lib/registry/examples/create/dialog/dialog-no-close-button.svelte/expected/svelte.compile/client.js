import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Dialog_no_close_button($$anchor) {
	Example($$anchor, {
		title: 'No Close Button',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('No Close Button');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								showCloseButton: false,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('No Close Button');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('This dialog doesn\'t have a close button in the top-right corner.');

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

									$.component(node_6, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
										Dialog_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Close');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_7, () => Dialog.Close, ($$anchor, Dialog_Close) => {
														Dialog_Close($$anchor, { child, $$slots: { child: true } });
													});
												}

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