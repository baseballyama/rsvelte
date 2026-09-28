import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, Dialog } from "bits-ui";

var root = $.from_html(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 flex items-center justify-center border p-3 text-sm font-medium">Tooltip Content</div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_html(
	`<p>Dialog Content</p> <p>Click "Close" to close dialog and hover tooltip again. The tooltip will not
					appear.</p> <!>`,
	1
);

export default function _page($$anchor) {
	let open = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						delayDuration: 200,
						disableCloseOnTriggerClick: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									class: 'inline-flex size-fit items-center justify-center',
									onclick: () => $.set(open, true),
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Hover Me & Then Click');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, {
									sideOffset: 8,
									side: 'bottom',
									children: ($$anchor, $$slotProps) => {
										var div = root();

										$.append($$anchor, div);
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

				$.component(node_4, () => Dialog.Root, ($$anchor, Dialog_Root) => {
					Dialog_Root($$anchor, {
						get open() {
							return $.get(open);
						},

						set open($$value) {
							$.set(open, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
								Dialog_Portal($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Dialog.Content, ($$anchor, Dialog_Content) => {
											Dialog_Content($$anchor, {
												class: 'rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 border p-3 text-sm font-medium',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();
													var node_7 = $.sibling($.first_child(fragment_5), 4);

													$.component(node_7, () => Dialog.Close, ($$anchor, Dialog_Close) => {
														Dialog_Close($$anchor, {
															class: 'block',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Close');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

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
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}