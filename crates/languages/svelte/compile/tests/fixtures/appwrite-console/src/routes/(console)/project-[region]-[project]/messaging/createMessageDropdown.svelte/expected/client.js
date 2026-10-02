import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/elements/forms';
import { providers } from './providers/store';
import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { base } from '$app/paths';
import { page } from '$app/state';

export default function CreateMessageDropdown($$anchor, $$props) {
	$.push($$props, true);

	Popover($$anchor, {
		padding: 'none',
		placement: 'bottom-end',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const toggle = $.derived(() => $$slotProps.toggle);
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.slot(
					node,
					$$props,
					'default',
					{
						get toggle() {
							return $.get(toggle);
						}
					},
					($$anchor) => {
						Button($$anchor, {
							event: 'create_message',
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Create message');

								$.append($$anchor, text);
							},

							$$slots: {
								default: true,
								start: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										get icon() {
											return IconPlus;
										},
										slot: 'start',
										size: 's'
									});
								}
							}
						});
					}
				);

				$.append($$anchor, fragment_1);
			},

			tooltip: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_1 = $.first_child(fragment_4);

				$.component(node_1, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
					ActionMenu_Root($$anchor, {
						slot: 'tooltip',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_2 = $.first_child(fragment_5);

							$.each(node_2, 17, () => Object.entries(providers), $.index, ($$anchor, $$item) => {
								var $$array = $.derived(() => $.to_array($.get($$item), 2));
								let type = () => $.get($$array)[0];
								let option = () => $.get($$array)[1];
								var fragment_6 = $.comment();
								var node_3 = $.first_child(fragment_6);

								{
									let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/messaging/create-${type()}`);

									$.component(node_3, () => ActionMenu.Item.Anchor, ($$anchor, ActionMenu_Item_Anchor) => {
										ActionMenu_Item_Anchor($$anchor, {
											get leadingIcon() {
												return option().icon;
											},

											get href() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, option().name));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_6);
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			}
		}
	});

	$.pop();
}