import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IPv4AddressInput } from '$lib/components/ui/ipv4address-input';
import * as Card from '$lib/components/ui/card';
import { Label } from '$lib/components/ui/label';
import Button from '$lib/components/button.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-2"><div class="flex place-items-center justify-between gap-2"><!> <!></div> <div class="flex place-items-center justify-between gap-2"><!> <!></div> <div class="flex place-items-center justify-between gap-2"><!> <!></div></div> <!>`, 1);

export default function Configure_device($$anchor) {
	let loading = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Network Configuration');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Configure device network settings.');

										$.append($$anchor, text_1);
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

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var div = $.first_child(fragment_3);
							var div_1 = $.child(div);
							var node_5 = $.child(div_1);

							Label(node_5, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('IP Address');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							IPv4AddressInput(node_6, { value: '172 16 230 22' });
							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_7 = $.child(div_2);

							Label(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Subnet Mask');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							IPv4AddressInput(node_8, { value: '255 255 255 0' });
							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var node_9 = $.child(div_3);

							Label(node_9, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Gateway');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							IPv4AddressInput(node_10, { placeholder: '0 0 0 0' });
							$.reset(div_3);
							$.reset(div);

							var node_11 = $.sibling(div, 2);

							Button(node_11, {
								get loading() {
									return $.get(loading);
								},
								class: 'w-full',
								onclick: () => {
									$.set(loading, true);

									setTimeout(
										() => {
											$.set(loading, false);
										},
										500
									);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Configure');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
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