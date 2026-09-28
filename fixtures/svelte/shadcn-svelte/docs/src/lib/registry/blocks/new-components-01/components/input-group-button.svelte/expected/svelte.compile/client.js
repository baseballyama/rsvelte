import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InfoIcon from "@lucide/svelte/icons/info";
import StarIcon from "@lucide/svelte/icons/star";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<p class="font-medium">Your connection is not secure.</p> <p>You should not enter any sensitive information on this site.</p>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid w-full max-w-sm gap-6"><!> <!></div>`);

export default function Input_group_button($$anchor) {
	let isFavorite = $.state(false);
	var div = root_3();
	var node = $.child(div);

	Label(node, {
		for: 'input-secure-19',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input Secure');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			class: '[--radius:9999px]',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { id: 'input-secure-19', class: '!ps-0.5' });
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Popover.Root, ($$anchor, Popover_Root) => {
					Popover_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_4 = $.first_child(fragment_1);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var fragment_2 = $.comment();
									var node_5 = $.first_child(fragment_2);

									$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
										InputGroup_Addon($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_6 = $.first_child(fragment_3);

												$.component(node_6, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
													InputGroup_Button($$anchor, $.spread_props(props, {
														variant: 'secondary',
														size: 'icon-xs',
														'aria-label': 'Info',
														children: ($$anchor, $$slotProps) => {
															InfoIcon($$anchor, {});
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								};

								$.component(node_4, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
									Popover_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_7 = $.sibling(node_4, 2);

							$.component(node_7, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									align: 'start',
									alignOffset: 10,
									class: 'flex flex-col gap-1 rounded-xl text-sm',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();

										$.next(2);
										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_3, 2);

				$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						class: '!ps-1 text-muted-foreground',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('https://');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
					InputGroup_Addon_2($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_10 = $.first_child(fragment_6);

							$.component(node_10, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
								InputGroup_Button_1($$anchor, {
									onclick: () => $.set(isFavorite, !$.get(isFavorite)),
									size: 'icon-xs',
									'aria-label': 'Favorite',
									children: ($$anchor, $$slotProps) => {
										StarIcon($$anchor, {
											get 'data-favorite'() {
												return $.get(isFavorite);
											},
											class: 'data-[favorite=true]:fill-primary data-[favorite=true]:stroke-primary'
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}