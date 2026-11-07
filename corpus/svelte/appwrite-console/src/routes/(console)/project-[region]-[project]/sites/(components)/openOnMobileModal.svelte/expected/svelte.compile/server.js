import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Modal } from '$lib/components';
import Card from '$lib/components/card.svelte';
import { Button, InputSelect } from '$lib/elements/forms';
import { copy } from '$lib/helpers/copy';
import { sdk } from '$lib/stores/sdk';
import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
import { Icon, Image, Layout, Tooltip } from '@appwrite.io/pink-svelte';
import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';

export default function OpenOnMobileModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = void 0, proxyRuleList, selectedUrl = '' } = $$props;

		const options = proxyRuleList?.total
			? proxyRuleList.rules.map((rule) => {
				return {
					label: rule.domain,
					value: $.store_get($$store_subs ??= {}, '$regionalProtocol', regionalProtocol) + rule.domain
				};
			})
			: [];

		let url = selectedUrl
			? $.store_get($$store_subs ??= {}, '$regionalProtocol', regionalProtocol) + selectedUrl
			: options[0]?.value ?? '';

		let tooltipMessage = 'Copy';

		function getImage(url) {
			return sdk.forProject(page.params.region, page.params.project).avatars.getQR({ text: url, size: 352 });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Open on mobile',
				hideFooter: true,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'l',
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'm',
										direction: 'row',
										children: ($$renderer) => {
											$$renderer.push(`<div style="width: 100%;max-width: 91.5%">`);

											InputSelect($$renderer, {
												id: 'copy',
												options,
												get value() {
													return url;
												},

												set value($$value) {
													url = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> `);

											Tooltip($$renderer, {
												placement: 'bottom',
												children: ($$renderer) => {
													$$renderer.push(`<div>`);

													Button($$renderer, {
														secondary: true,
														icon: true,
														children: ($$renderer) => {
															Icon($$renderer, { icon: IconDuplicate });
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div>`);
												},

												$$slots: {
													default: true,
													tooltip: ($$renderer) => {
														{
															$$renderer.push(`${$.escape(tooltipMessage)}`);
														}
													}
												}
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								Card($$renderer, {
									padding: 'l',
									radius: 'l',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												justifyContent: 'center',
												alignItems: 'center',
												children: ($$renderer) => {
													Image($$renderer, {
														src: getImage(url),
														height: 176,
														width: 176,
														alt: 'QR code',
														radius: 'xxs'
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					description: ($$renderer) => {
						$$renderer.push(`<span slot="description">Open the preview of your site on any mobile or tablet device.</span>`);
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show });
	});
}