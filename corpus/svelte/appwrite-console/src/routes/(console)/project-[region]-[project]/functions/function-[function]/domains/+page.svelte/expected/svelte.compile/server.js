import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		const isDomainLimitReached = $.derived(() => isServiceLimited('domains', $.store_get($$store_subs ??= {}, '$organization', organization), data.proxyRules.total));
		let showDelete = false;
		let showRetry = false;
		let selectedProxyRule = null;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							justifyContent: 'space-between',
							children: ($$renderer) => {
								SearchQuery($$renderer, { placeholder: 'Search domain' });
								$$renderer.push(`<!----> `);

								Tooltip($$renderer, {
									disabled: !isDomainLimitReached(),
									maxWidth: BODY_TOOLTIP_MAX_WIDTH,
									children: ($$renderer) => {
										$$renderer.push(`<div>`);

										Button($$renderer, {
											disabled: isDomainLimitReached(),
											href: isDomainLimitReached()
												? undefined
												: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/domains/add-domain`,

											children: ($$renderer) => {
												Icon($$renderer, { icon: IconPlus, size: 's' });
												$$renderer.push(`<!----> Add domain`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									},

									$$slots: {
										default: true,
										tooltip: ($$renderer) => {
											{
												$$renderer.push(`<div${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE_PRELINE)}>You have reached the maximum number of custom domains for your plan.</div>`);
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

					if (data.proxyRules.total) {
						$$renderer.push('<!--[0-->');

						Table($$renderer, {
							proxyRules: data.proxyRules,
							organizationDomains: data.organizationDomains
						});

						$$renderer.push(`<!----> `);

						PaginationWithLimit($$renderer, {
							name: 'Domains',
							limit: data.limit,
							offset: data.offset,
							total: data.proxyRules.total
						});

						$$renderer.push(`<!---->`);
					} else if (data?.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							hidePages: true,
							target: 'domains',
							hidePagination: true,
							get search() {
								return data.search;
							},

							set search($$value) {
								data.search = $$value;
								$$settled = false;
							},

							$$slots: {
								actions: ($$renderer) => {
									{
										Button($$renderer, {
											secondary: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Clear search`);
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');

						if (Card.Base) {
							$$renderer.push('<!--[-->');

							Card.Base($$renderer, {
								padding: 'none',
								children: ($$renderer) => {
									Empty($$renderer, {
										src: $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark'
											? `${base}/images/domains/empty-domain-dark.svg`
											: `${base}/images/domains/empty-domain-light.svg`,
										title: 'Use a custom domain for your function',
										description: 'Make your function easier to access and integrate by assigning it a custom domain.',
										$$slots: {
											actions: ($$renderer) => {
												{
													Button($$renderer, {
														external: true,
														href: 'https://appwrite.io/docs/products/functions/domains',
														text: true,
														event: 'empty_documentation',
														size: 's',
														ariaLabel: 'add domain',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Documentation`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Tooltip($$renderer, {
														disabled: !isDomainLimitReached(),
														maxWidth: BODY_TOOLTIP_MAX_WIDTH,
														children: ($$renderer) => {
															$$renderer.push(`<div>`);

															Button($$renderer, {
																secondary: true,
																disabled: isDomainLimitReached(),
																href: isDomainLimitReached()
																	? undefined
																	: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/domains/add-domain`,
																size: 's',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Add domain`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----></div>`);
														},

														$$slots: {
															default: true,
															tooltip: ($$renderer) => {
																{
																	$$renderer.push(`<div${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE_PRELINE)}>You have reached the maximum number of custom domains for your plan.</div>`);
																}
															}
														}
													});

													$$renderer.push(`<!---->`);
												}
											}
										}
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (showDelete) {
				$$renderer.push('<!--[0-->');

				DeleteDomainModal($$renderer, {
					selectedProxyRule,
					get show() {
						return showDelete;
					},

					set show($$value) {
						showDelete = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showRetry) {
				$$renderer.push('<!--[0-->');

				RetryDomainModal($$renderer, {
					selectedProxyRule,
					get show() {
						return showRetry;
					},

					set show($$value) {
						showRetry = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}