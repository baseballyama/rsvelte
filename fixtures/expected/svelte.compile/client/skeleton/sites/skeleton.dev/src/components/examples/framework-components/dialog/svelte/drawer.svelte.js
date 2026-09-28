import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import XIcon from '@lucide/svelte/icons/x';
import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<header class="flex justify-between items-center"><!> <!></header> <p>A slide out drawer panel.</p>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Drawer($$anchor) {
	// The following animations are optional.
	// These may also be included inline.
	const animBackdrop = 'transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100';

	const animModal = 'transition transition-discrete opacity-0 -translate-x-full starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0';

	Dialog($$anchor, {
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
						Dialog_Backdrop($$anchor, {
							class: 'fixed inset-0 z-50 bg-surface-50-950/50 transition transition-discrete transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100'
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Dialog.Positioner, ($$anchor, Dialog_Positioner) => {
						Dialog_Positioner($$anchor, {
							class: 'fixed inset-0 z-50 flex justify-start',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
									Dialog_Content($$anchor, {
										class: 'h-screen card bg-surface-100-900 w-sm p-4 space-y-4 shadow-xl transition transition-discrete opacity-0 -translate-x-full starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var header = $.first_child(fragment_4);
											var node_5 = $.child(header);

											$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
												Dialog_Title($$anchor, {
													class: 'text-2xl font-bold',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Drawer');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => Dialog.CloseTrigger, ($$anchor, Dialog_CloseTrigger) => {
												Dialog_CloseTrigger($$anchor, {
													class: 'btn-icon preset-tonal',
													children: ($$anchor, $$slotProps) => {
														XIcon($$anchor, {});
													},
													$$slots: { default: true }
												});
											});

											$.reset(header);
											$.next(2);
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