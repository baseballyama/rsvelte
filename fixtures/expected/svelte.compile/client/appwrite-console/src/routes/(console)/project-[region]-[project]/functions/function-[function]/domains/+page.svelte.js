import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { EmptySearch, PaginationWithLimit } from '$lib/components/index.js';
import { Button } from '$lib/elements/forms';
import Container from '$lib/layout/container.svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { Card, Empty, Icon, Layout, Tooltip } from '@appwrite.io/pink-svelte';
import DeleteDomainModal from './deleteDomainModal.svelte';
import RetryDomainModal from './retryDomainModal.svelte';
import SearchQuery from '$lib/components/searchQuery.svelte';
import { app } from '$lib/stores/app';
import { Click, trackEvent } from '$lib/actions/analytics';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE } from '$lib/helpers/tooltipContent';
import { isServiceLimited } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import Table from './table.svelte';

var root = $.from_html(`<!> Add domain`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<div>You have reached the maximum number of custom domains for your plan.</div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let data = $.prop($$props, 'data', 7);
	const isDomainLimitReached = $.derived(() => isServiceLimited('domains', $organization(), data().proxyRules.total));
	let showDelete = $.state(false);
	let showRetry = $.state(false);
	let selectedProxyRule = null;
	var fragment = root_4();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					justifyContent: 'space-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_2 = $.first_child(fragment_2);

						SearchQuery(node_2, { placeholder: 'Search domain' });

						var node_3 = $.sibling(node_2, 2);

						{
							let $0 = $.derived(() => !$.get(isDomainLimitReached));

							Tooltip(node_3, {
								get disabled() {
									return $.get($0);
								},

								get maxWidth() {
									return BODY_TOOLTIP_MAX_WIDTH;
								},

								children: ($$anchor, $$slotProps) => {
									var div = root_1();
									var node_4 = $.child(div);

									{
										let $0 = $.derived(() => $.get(isDomainLimitReached)
											? undefined
											: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/domains/add-domain`);

										Button(node_4, {
											get disabled() {
												return $.get(isDomainLimitReached);
											},

											get href() {
												return $.get($0);
											},

											$$events: {
												click: () => {
													trackEvent(Click.DomainCreateClick, { source: 'functions_domain_overview' });
												}
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root();
												var node_5 = $.first_child(fragment_3);

												Icon(node_5, {
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

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_4 = root_3();
					var node_7 = $.first_child(fragment_4);

					Table(node_7, {
						get proxyRules() {
							return data().proxyRules;
						},

						get organizationDomains() {
							return data().organizationDomains;
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PaginationWithLimit(node_8, {
						name: 'Domains',
						get limit() {
							return data().limit;
						},

						get offset() {
							return data().offset;
						},

						get total() {
							return data().proxyRules.total;
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

						$$slots: {
							actions: ($$anchor, $$slotProps) => {
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
							}
						}
					});
				};

				var alternate = ($$anchor) => {
					var fragment_7 = $.comment();
					var node_9 = $.first_child(fragment_7);

					$.component(node_9, () => Card.Base, ($$anchor, Card_Base) => {
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
										title: 'Use a custom domain for your function',
										description: 'Make your function easier to access and integrate by assigning it a custom domain.',
										$$slots: {
											actions: ($$anchor, $$slotProps) => {
												var fragment_9 = root_3();
												var node_10 = $.first_child(fragment_9);

												Button(node_10, {
													external: true,
													href: 'https://appwrite.io/docs/products/functions/domains',
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

												var node_11 = $.sibling(node_10, 2);

												{
													let $0 = $.derived(() => !$.get(isDomainLimitReached));

													Tooltip(node_11, {
														get disabled() {
															return $.get($0);
														},

														get maxWidth() {
															return BODY_TOOLTIP_MAX_WIDTH;
														},

														children: ($$anchor, $$slotProps) => {
															var div_2 = root_1();
															var node_12 = $.child(div_2);

															{
																let $0 = $.derived(() => $.get(isDomainLimitReached)
																	? undefined
																	: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/domains/add-domain`);

																Button(node_12, {
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

				$.if(node_6, ($$render) => {
					if (data().proxyRules.total) $$render(consequent); else if (data()?.search) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			DeleteDomainModal($$anchor, {
				selectedProxyRule,
				get show() {
					return $.get(showDelete);
				},

				set show($$value) {
					$.set(showDelete, $$value, true);
				}
			});
		};

		$.if(node_13, ($$render) => {
			if ($.get(showDelete)) $$render(consequent_2);
		});
	}

	var node_14 = $.sibling(node_13, 2);

	{
		var consequent_3 = ($$anchor) => {
			RetryDomainModal($$anchor, {
				selectedProxyRule,
				get show() {
					return $.get(showRetry);
				},

				set show($$value) {
					$.set(showRetry, $$value, true);
				}
			});
		};

		$.if(node_14, ($$render) => {
			if ($.get(showRetry)) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}