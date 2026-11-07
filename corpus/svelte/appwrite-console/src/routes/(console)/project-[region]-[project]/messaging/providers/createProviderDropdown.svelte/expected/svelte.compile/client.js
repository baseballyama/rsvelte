import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { wizard } from '$lib/stores/wizard';
import { providers } from './store';
import Create from './create.svelte';
import { providerType, provider } from './wizard/store';
import { Providers } from '../provider.svelte';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { MessagingProviderType } from '@appwrite.io/console';
import { ActionMenu, Popover } from '@appwrite.io/pink-svelte';

export default function CreateProviderDropdown($$anchor, $$props) {
	$.push($$props, true);

	const $providerType = () => $.store_get(providerType, '$providerType', $$stores);
	const $provider = () => $.store_get(provider, '$provider', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
					null
				);

				$.append($$anchor, fragment_1);
			},

			tooltip: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				$.component(node_1, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
					ActionMenu_Root($$anchor, {
						slot: 'tooltip',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.each(node_2, 17, () => Object.entries(providers), $.index, ($$anchor, $$item) => {
								var $$array = $.derived(() => $.to_array($.get($$item), 2));
								let type = () => $.get($$array)[0];
								let option = () => $.get($$array)[1];
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
									ActionMenu_Item_Button($$anchor, {
										get leadingIcon() {
											return option().icon;
										},

										$$events: {
											click: () => {
												if (type() !== MessagingProviderType.Email && type() !== MessagingProviderType.Sms && type() !== MessagingProviderType.Push) return;

												$.store_set(providerType, type());

												const p = Object.keys(providers[type()].providers).shift();

												if (p && isValueOfStringEnum(Providers, p)) {
													$.store_set(provider, p);
												}

												wizard.start(Create);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, option().name));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			}
		}
	});

	$.pop();
	$$cleanup();
}