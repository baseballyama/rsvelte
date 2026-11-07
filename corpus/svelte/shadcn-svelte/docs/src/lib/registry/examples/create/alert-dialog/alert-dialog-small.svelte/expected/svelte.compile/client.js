import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Alert_dialog_small($$anchor) {
	let open = $.state(false);

	Example($$anchor, {
		title: 'Small',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
				AlertDialog_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
							AlertDialog_Trigger($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Small');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
							AlertDialog_Content($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
										AlertDialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
													AlertDialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Allow accessory to connect?');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
													AlertDialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Do you want to allow the USB accessory to connect to this device?');

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

									$.component(node_6, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
										AlertDialog_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
													AlertDialog_Cancel($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Don\'t allow');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
													AlertDialog_Action($$anchor, {
														onclick: () => $.set(open, false),
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Allow');

															$.append($$anchor, text_4);
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