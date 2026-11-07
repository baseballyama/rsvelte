import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Modal } from '$lib/components';
import Card from '$lib/components/card.svelte';
import { Button, InputSelect } from '$lib/elements/forms';
import { copy } from '$lib/helpers/copy';
import { sdk } from '$lib/stores/sdk';
import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
import { Icon, Image, Layout, Tooltip } from '@appwrite.io/pink-svelte';
import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div style="width: 100%;max-width: 91.5%"><!></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<span slot="description">Open the preview of your site on any mobile or tablet device.</span>`);

export default function OpenOnMobileModal($$anchor, $$props) {
	$.push($$props, true);

	const $regionalProtocol = () => $.store_get(regionalProtocol, '$regionalProtocol', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15),
		selectedUrl = $.prop($$props, 'selectedUrl', 3, '');

	const options = $$props.proxyRuleList?.total
		? $$props.proxyRuleList.rules.map((rule) => {
			return { label: rule.domain, value: $regionalProtocol() + rule.domain };
		})
		: [];

	let url = $.state($.proxy(selectedUrl()
		? $regionalProtocol() + selectedUrl()
		: options[0]?.value ?? ''));

	let tooltipMessage = $.state('Copy');

	function getImage(url) {
		return sdk.forProject(page.params.region, page.params.project).avatars.getQR({ text: url, size: 352 });
	}

	Modal($$anchor, {
		title: 'Open on mobile',
		hideFooter: true,
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 'l',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 'm',
								direction: 'row',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var div = $.first_child(fragment_3);
									var node_2 = $.child(div);

									InputSelect(node_2, {
										id: 'copy',
										get options() {
											return options;
										},

										get value() {
											return $.get(url);
										},

										set value($$value) {
											$.set(url, $$value, true);
										}
									});

									$.reset(div);

									var node_3 = $.sibling(div, 2);

									Tooltip(node_3, {
										placement: 'bottom',
										children: ($$anchor, $$slotProps) => {
											var div_1 = root();
											var node_4 = $.child(div_1);

											Button(node_4, {
												secondary: true,
												icon: true,
												$$events: {
													click: () => {
														copy($.get(url));
														$.set(tooltipMessage, 'Copied');

														setTimeout(
															() => {
																$.set(tooltipMessage, 'Copy');
															},
															1000
														);
													}
												},

												children: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														get icon() {
															return IconDuplicate;
														}
													});
												},
												$$slots: { default: true }
											});

											$.reset(div_1);
											$.append($$anchor, div_1);
										},

										$$slots: {
											default: true,
											tooltip: ($$anchor, $$slotProps) => {
												var text = $.text();

												$.template_effect(() => $.set_text(text, $.get(tooltipMessage)));
												$.append($$anchor, text);
											}
										}
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_1, 2);

						Card(node_5, {
							padding: 'l',
							radius: 'l',
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_6 = $.first_child(fragment_6);

								$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
									Layout_Stack_2($$anchor, {
										justifyContent: 'center',
										alignItems: 'center',
										children: ($$anchor, $$slotProps) => {
											{
												let $0 = $.derived(() => getImage($.get(url)));

												Image($$anchor, {
													get src() {
														return $.get($0);
													},
													height: 176,
													width: 176,
													alt: 'QR code',
													radius: 'xxs'
												});
											}
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			description: ($$anchor, $$slotProps) => {
				var span = root_3();

				$.append($$anchor, span);
			}
		}
	});

	$.pop();
	$$cleanup();
}