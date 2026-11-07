import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { EmptySearch, PaginationWithLimit } from '$lib/components/index.js';
import { Button } from '$lib/elements/forms';
import Container from '$lib/layout/container.svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { Card, Empty, Icon, Tooltip } from '@appwrite.io/pink-svelte';
import { app } from '$lib/stores/app';
import { Click, trackEvent } from '$lib/actions/analytics';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE } from '$lib/helpers/tooltipContent';
import { isServiceLimited } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import Table from './table.svelte';
import { ResponsiveContainerHeader } from '$lib/layout';

var root = $.from_html(`<!> Add domain`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<div>You have reached the maximum number of custom domains for your plan.</div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let data = $.prop($$props, 'data', 7);
	const isDomainLimitReached = $.derived(() => isServiceLimited('domains', $organization(), data().rules.total));

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			ResponsiveContainerHeader(node, {
				hasSearch: true,
				hideView: true,
				searchPlaceholder: 'Search by domain',
				analyticsSource: 'settings_domain_overview',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => !$.get(isDomainLimitReached));

						Tooltip($$anchor, {
							get disabled() {
								return $.get($0);
							},

							get maxWidth() {
								return BODY_TOOLTIP_MAX_WIDTH;
							},

							children: ($$anchor, $$slotProps) => {
								var div = root_1();
								var node_1 = $.child(div);

								{
									let $0 = $.derived(() => $.get(isDomainLimitReached)
										? undefined
										: `${base}/project-${page.params.region}-${page.params.project}/settings/domains/add-domain`);

									Button(node_1, {
										get disabled() {
											return $.get(isDomainLimitReached);
										},

										get href() {
											return $.get($0);
										},

										$$events: {
											click: () => {
												trackEvent(Click.DomainCreateClick, { source: 'settings_domain_overview' });
											}
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_2 = $.first_child(fragment_3);

											Icon(node_2, {
												get icon() {
													return IconPlus;
												},
												size: 's'
											});

											$.next();
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								}

								$.reset(div);
								$.append($$anchor, div);
							},

							$$slots: {
								default: true,
								tooltip: ($$anchor, $$slotProps) => {
									var div_1 = root_2();

									$.template_effect(() => $.set_style(div_1, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE));
									$.append($$anchor, div_1);
								}
							}
						});
					}
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_4 = root_3();
					var node_4 = $.first_child(fragment_4);

					Table(node_4, {
						get domains() {
							return data().rules;
						},

						get organizationDomains() {
							return data().organizationDomains;
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PaginationWithLimit(node_5, {
						name: 'Domains',
						get limit() {
							return data().limit;
						},

						get offset() {
							return data().offset;
						},

						get total() {
							return data().rules.total;
						}
					});

					$.append($$anchor, fragment_4);
				};

				var consequent_1 = ($$anchor) => {
					EmptySearch($$anchor, {
						hidePages: true,
						target: 'domains',
						hidePagination: true,
						get search() {
							return data().search;
						},

						set search($$value) {
							data().search = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								secondary: true,
								$$events: {
									click: () => {
										data().search = '';
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Clear search');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					var fragment_7 = $.comment();
					var node_6 = $.first_child(fragment_7);

					$.component(node_6, () => Card.Base, ($$anchor, Card_Base) => {
						Card_Base($$anchor, {
							padding: 'none',
							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => $app().themeInUse === 'dark'
										? `${base}/images/domains/empty-domain-dark.svg`
										: `${base}/images/domains/empty-domain-light.svg`);

									Empty($$anchor, {
										get src() {
											return $.get($0);
										},
										title: 'Use a custom domain for your API',
										description: 'Connect your own domain to Appwrite, so your API is accessible from a custom URL instead of the default Appwrite endpoint.',
										$$slots: {
											actions: ($$anchor, $$slotProps) => {
												var fragment_9 = root_3();
												var node_7 = $.first_child(fragment_9);

												Button(node_7, {
													external: true,
													href: 'https://appwrite.io/docs/advanced/platform/custom-domains',
													text: true,
													event: 'empty_documentation',
													size: 's',
													ariaLabel: 'add domain',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Documentation');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});

												var node_8 = $.sibling(node_7, 2);

												{
													let $0 = $.derived(() => !$.get(isDomainLimitReached));

													Tooltip(node_8, {
														get disabled() {
															return $.get($0);
														},

														get maxWidth() {
															return BODY_TOOLTIP_MAX_WIDTH;
														},

														children: ($$anchor, $$slotProps) => {
															var div_2 = root_1();
															var node_9 = $.child(div_2);

															{
																let $0 = $.derived(() => $.get(isDomainLimitReached)
																	? undefined
																	: `${base}/project-${page.params.region}-${page.params.project}/settings/domains/add-domain`);

																Button(node_9, {
																	secondary: true,
																	get disabled() {
																		return $.get(isDomainLimitReached);
																	},

																	get href() {
																		return $.get($0);
																	},
																	size: 's',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Add domain');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															}

															$.reset(div_2);
															$.append($$anchor, div_2);
														},

														$$slots: {
															default: true,
															tooltip: ($$anchor, $$slotProps) => {
																var div_3 = root_2();

																$.template_effect(() => $.set_style(div_3, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE));
																$.append($$anchor, div_3);
															}
														}
													});
												}

												$.append($$anchor, fragment_9);
											}
										}
									});
								}
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				};

				$.if(node_3, ($$render) => {
					if (data().rules.total) $$render(consequent); else if (data()?.search) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}