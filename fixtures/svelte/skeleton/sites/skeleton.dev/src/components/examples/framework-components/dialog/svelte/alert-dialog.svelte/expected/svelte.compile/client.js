import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Alert_dialog($$anchor) {
	Dialog($$anchor, {
		role: 'alertdialog',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
				Dialog_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Trigger');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			Portal(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Dialog.Backdrop, ($$anchor, Dialog_Backdrop) => {
						Dialog_Backdrop($$anchor, { class: 'fixed inset-0 z-50 bg-error-50-950/50' });
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Dialog.Positioner, ($$anchor, Dialog_Positioner) => {
						Dialog_Positioner($$anchor, {
							class: 'fixed inset-0 z-50 flex justify-center items-center',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
									Dialog_Content($$anchor, {
										class: 'card preset-filled-error-500 w-md p-4 space-y-2 shadow-xl',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_5 = $.first_child(fragment_4);

											$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
												Dialog_Title($$anchor, {
													class: 'text-2xl font-bold',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Alert');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description) => {
												Dialog_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Something important has happened!');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_6, 2);

											$.component(node_7, () => Dialog.CloseTrigger, ($$anchor, Dialog_CloseTrigger) => {
												Dialog_CloseTrigger($$anchor, {
													class: 'btn preset-tonal-error',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Close');

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

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}