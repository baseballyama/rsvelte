import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Portal, usePopover } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><button class="btn preset-filled">Show for 3 seconds</button> <!></div>`);

export default function Provider_pattern($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const popover = usePopover({ id, closeOnInteractOutside: false });

	function showAndHide() {
		popover().setOpen(true);

		setTimeout(
			() => {
				popover().setOpen(false);
			},
			3000
		);
	}

	var div = root_1();
	var button = $.child(div);
	var node = $.sibling(button, 2);

	$.component(node, () => Popover.Provider, ($$anchor, Popover_Provider) => {
		Popover_Provider($$anchor, {
			get value() {
				return popover;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						class: 'btn preset-tonal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Anchor');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				Portal(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Popover.Positioner, ($$anchor, Popover_Positioner) => {
							Popover_Positioner($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
										Popover_Content($$anchor, {
											class: 'card max-w-sm p-4 bg-surface-100-900 shadow-xl space-y-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_5 = $.first_child(fragment_3);

												$.component(node_5, () => Popover.Description, ($$anchor, Popover_Description) => {
													Popover_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('This popover will appear, stay open for three seconds, then close on it\'s own.');

															$.append($$anchor, text_1);
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
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.delegated('click', button, showAndHide);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);