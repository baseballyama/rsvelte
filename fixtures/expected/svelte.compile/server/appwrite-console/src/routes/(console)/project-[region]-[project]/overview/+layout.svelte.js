import * as $ from 'svelte/internal/server';
import { afterNavigate, goto } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';
import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
import { PlatformsPanel } from '$lib/commandCenter/panels';
import { Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { Container } from '$lib/layout';
import { onMount, setContext } from 'svelte';
import Bandwidth from './bandwidth.svelte';
import Requests from './requests.svelte';
import { usage } from './store';
import { periodToDates } from '$lib/layout/usageHelpers';
import { canWriteProjects } from '$lib/stores/roles';
import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
import { writable } from 'svelte/store';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { total } from '$lib/helpers/array';
import { clampMin } from '$lib/helpers/numbers';

export function totalMetrics(set) {
	if (!set) return 0;

	return clampMin(total(set.map((c) => c.value)));
}

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let period = '30d';
		const path = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/overview`);

		onMount(handle);
		afterNavigate(handle);

		const action = setContext('overview-action', writable(null));

		async function handle() {
			const promise = changePeriod(period);

			if ($.store_get($$store_subs ??= {}, '$usage', usage)) {
				await promise;
			}
		}

		function changePeriod(newPeriod) {
			period = newPeriod;

			const dates = periodToDates(newPeriod);

			return usage.load(dates.start, dates.end, dates.period);
		}

		const integrationTabs = $.derived(() => [
			{
				href: `${path()}/platforms`,
				title: 'Platforms',
				event: 'platforms',
				hasChildren: true
			},

			{
				href: `${path()}/api-keys`,
				title: 'API keys',
				event: 'api-keys',
				hasChildren: true
			},

			{
				href: `${path()}/dev-keys`,
				title: 'Dev keys',
				event: 'dev-keys',
				hasChildren: true
			}
		]);

		$.head('wapswn', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Console - Appwrite</title>`);
			});
		});

		Container($$renderer, {
			overlapCover: true,
			children: ($$renderer) => {
				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						gap: 'xxl',
						children: ($$renderer) => {
							if ($.store_get($$store_subs ??= {}, '$usage', usage)) {
								$$renderer.push('<!--[0-->');

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'l',
										direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
										children: ($$renderer) => {
											if (Card.Base) {
												$$renderer.push('<!--[-->');

												Card.Base($$renderer, {
													class: 'is-2-columns-medium-screen is-3-columns-large-screen',
													padding: 's',
													children: ($$renderer) => {
														Bandwidth($$renderer, { period });
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Card.Base) {
												$$renderer.push('<!--[-->');

												Card.Base($$renderer, {
													class: 'is-2-columns-medium-screen is-3-columns-large-screen',
													padding: 's',
													children: ($$renderer) => {
														Requests($$renderer, { period });
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

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <div class="nav-tiles svelte-wapswn">`);

							if (Card.Link) {
								$$renderer.push('<!--[-->');

								Card.Link($$renderer, {
									padding: 's',
									href: `${base}/project-${page.params.region}-${page.params.project}/databases`,
									children: ($$renderer) => {
										$$renderer.push(`<div class="eyebrow-heading-3"><span class="icon-database" aria-hidden="true"></span> <span class="text">Database</span></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Link) {
								$$renderer.push('<!--[-->');

								Card.Link($$renderer, {
									padding: 's',
									href: `${base}/project-${page.params.region}-${page.params.project}/storage`,
									children: ($$renderer) => {
										$$renderer.push(`<div class="eyebrow-heading-3"><span class="icon-folder" aria-hidden="true"></span> <span class="text">Storage</span></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Link) {
								$$renderer.push('<!--[-->');

								Card.Link($$renderer, {
									padding: 's',
									href: `${base}/project-${page.params.region}-${page.params.project}/auth`,
									children: ($$renderer) => {
										$$renderer.push(`<div class="eyebrow-heading-3"><span class="icon-user-group" aria-hidden="true"></span> <span class="text">Auth</span></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Link) {
								$$renderer.push('<!--[-->');

								Card.Link($$renderer, {
									padding: 's',
									href: `${base}/project-${page.params.region}-${page.params.project}/functions`,
									children: ($$renderer) => {
										$$renderer.push(`<div class="eyebrow-heading-3"><span class="icon-lightning-bolt" aria-hidden="true"></span> <span class="text">Functions</span></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</div> `);

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xl',
									children: ($$renderer) => {
										if (Typography.Title) {
											$$renderer.push('<!--[-->');

											Typography.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Integrations`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xl',
												direction: 'row',
												justifyContent: 'space-between',
												children: ($$renderer) => {
													Tabs($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(integrationTabs());

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let tab = each_array[$$index];

																Tab($$renderer, {
																	noscroll: true,
																	href: tab.href,
																	event: tab.event,
																	selected: isTabSelected(tab, page.url.pathname, path(), integrationTabs()),
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(tab.title)}`);
																	},
																	$$slots: { default: true }
																});
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													if ($.store_get($$store_subs ??= {}, '$action', action)) {
														$$renderer.push('<!--[0-->');

														if ($.store_get($$store_subs ??= {}, '$action', action)) {
															$$renderer.push('<!--[-->');
															$.store_get($$store_subs ??= {}, '$action', action)($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <!--[-->`);
										$.slot($$renderer, $$props, 'default', {}, null);
										$$renderer.push(`<!--]-->`);
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

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}