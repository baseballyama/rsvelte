import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MenuIcon from '@lucide/svelte/icons/menu';
import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<header class="flex justify-between items-center gap-4"><!> <!></header> <hr class="hr"/> <div class="overflow-y-auto"><!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Drawer($$anchor, $$props) {
	Dialog($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
				Dialog_Trigger($$anchor, {
					class: 'btn-icon hover:preset-tonal',
					children: ($$anchor, $$slotProps) => {
						MenuIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			Portal(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_2 = $.first_child(fragment_3);

					$.component(node_2, () => Dialog.Backdrop, ($$anchor, Dialog_Backdrop) => {
						Dialog_Backdrop($$anchor, {
							class: 'fixed inset-0 z-50 bg-surface-50-950/50 transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100'
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Dialog.Positioner, ($$anchor, Dialog_Positioner) => {
						Dialog_Positioner($$anchor, {
							class: 'fixed inset-0 z-50 flex justify-start',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
									Dialog_Content($$anchor, {
										class: 'card border-r border-surface-200-800 bg-surface-50-950/75 backdrop-blur-lg w-sm h-dvh p-4 space-y-4 shadow-xl overflow-y-auto hide-scrollbar-track transition transition-discrete opacity-0 -translate-x-full starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0 motion-reduce:transition-none',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var header = $.first_child(fragment_5);
											var node_5 = $.child(header);

											$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
												Dialog_Title($$anchor, {
													class: 'text-2xl font-bold',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Skeleton');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => Dialog.CloseTrigger, ($$anchor, Dialog_CloseTrigger) => {
												Dialog_CloseTrigger($$anchor, {
													class: 'btn-icon hover:preset-tonal rounded-full',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('×');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											$.reset(header);

											var div = $.sibling(header, 4);
											var node_7 = $.child(div);

											$.snippet(node_7, () => $$props.children);
											$.reset(div);
											$.append($$anchor, fragment_5);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}