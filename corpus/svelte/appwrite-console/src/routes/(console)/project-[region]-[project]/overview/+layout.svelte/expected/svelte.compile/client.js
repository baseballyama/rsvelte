import 'svelte/internal/disclose-version';
import { total } from '$lib/helpers/array';
import { clampMin } from '$lib/helpers/numbers';
import * as $ from 'svelte/internal/client';
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

export function totalMetrics(set) {
	if (!set) return 0;

	return clampMin(total(set.map((c) => c.value)));
}

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="eyebrow-heading-3"><span class="icon-database" aria-hidden="true"></span> <span class="text">Database</span></div>`);
var root_2 = $.from_html(`<div class="eyebrow-heading-3"><span class="icon-folder" aria-hidden="true"></span> <span class="text">Storage</span></div>`);
var root_3 = $.from_html(`<div class="eyebrow-heading-3"><span class="icon-user-group" aria-hidden="true"></span> <span class="text">Auth</span></div>`);
var root_4 = $.from_html(`<div class="eyebrow-heading-3"><span class="icon-lightning-bolt" aria-hidden="true"></span> <span class="text">Functions</span></div>`);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <div class="nav-tiles svelte-wapswn"><!> <!> <!> <!></div> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $usage = () => $.store_get(usage, '$usage', $$stores);
	const $registerCommands = () => $.store_get(registerCommands, '$registerCommands', $$stores);
	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const $updateCommandGroupRanks = () => $.store_get(updateCommandGroupRanks, '$updateCommandGroupRanks', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $action = () => $.store_get(action, '$action', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let period = $.state('30d');
	const path = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/overview`);

	onMount(handle);
	afterNavigate(handle);

	const action = setContext('overview-action', writable(null));

	async function handle() {
		const promise = changePeriod($.get(period));

		if ($usage()) {
			await promise;
		}
	}

	function changePeriod(newPeriod) {
		$.set(period, newPeriod, true);

		const dates = periodToDates(newPeriod);

		return usage.load(dates.start, dates.end, dates.period);
	}

	const integrationTabs = $.derived(() => [
		{
			href: `${$.get(path)}/platforms`,
			title: 'Platforms',
			event: 'platforms',
			hasChildren: true
		},

		{
			href: `${$.get(path)}/api-keys`,
			title: 'API keys',
			event: 'api-keys',
			hasChildren: true
		},

		{
			href: `${$.get(path)}/dev-keys`,
			title: 'Dev keys',
			event: 'dev-keys',
			hasChildren: true
		}
	]);

	$.user_effect(() => {
		const unregister = $registerCommands()([
			{
				label: 'Add platform',
				keys: ['a', 'p'],
				callback() {
					addSubPanel(PlatformsPanel);
				},
				icon: IconPlus,
				group: 'integrations',
				disabled: !$canWriteProjects()
			},

			{
				label: 'Create API Key',
				icon: IconPlus,
				callback() {
					goto(`${$.get(path)}/api-keys/create`);
				},
				keys: ['c', 'k'],
				group: 'integrations',
				disabled: !$canWriteProjects()
			}
		]);

		$updateCommandGroupRanks()({ integrations: 10 });

		return unregister;
	});

	$.head('wapswn', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Console - Appwrite';
		});
	});

	Container($$anchor, {
		overlapCover: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 'xxl',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_6();
						var node_1 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

									$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											gap: 'l',
											get direction() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Card.Base, ($$anchor, Card_Base) => {
													Card_Base($$anchor, {
														class: 'is-2-columns-medium-screen is-3-columns-large-screen',
														padding: 's',
														children: ($$anchor, $$slotProps) => {
															Bandwidth($$anchor, {
																get period() {
																	return $.get(period);
																},
																$$events: { change: (e) => changePeriod(e.detail) }
															});
														},
														$$slots: { default: true }
													});
												});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => Card.Base, ($$anchor, Card_Base_1) => {
													Card_Base_1($$anchor, {
														class: 'is-2-columns-medium-screen is-3-columns-large-screen',
														padding: 's',
														children: ($$anchor, $$slotProps) => {
															Requests($$anchor, {
																get period() {
																	return $.get(period);
																},
																$$events: { change: (e) => changePeriod(e.detail) }
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_3);
							};

							$.if(node_1, ($$render) => {
								if ($usage()) $$render(consequent);
							});
						}

						var div = $.sibling(node_1, 2);
						var node_5 = $.child(div);

						{
							let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/databases`);

							$.component(node_5, () => Card.Link, ($$anchor, Card_Link) => {
								Card_Link($$anchor, {
									padding: 's',
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var div_1 = root_1();

										$.append($$anchor, div_1);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_6 = $.sibling(node_5, 2);

						{
							let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/storage`);

							$.component(node_6, () => Card.Link, ($$anchor, Card_Link_1) => {
								Card_Link_1($$anchor, {
									padding: 's',
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var div_2 = root_2();

										$.append($$anchor, div_2);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_7 = $.sibling(node_6, 2);

						{
							let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/auth`);

							$.component(node_7, () => Card.Link, ($$anchor, Card_Link_2) => {
								Card_Link_2($$anchor, {
									padding: 's',
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var div_3 = root_3();

										$.append($$anchor, div_3);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_8 = $.sibling(node_7, 2);

						{
							let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions`);

							$.component(node_8, () => Card.Link, ($$anchor, Card_Link_3) => {
								Card_Link_3($$anchor, {
									padding: 's',
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var div_4 = root_4();

										$.append($$anchor, div_4);
									},
									$$slots: { default: true }
								});
							});
						}

						$.reset(div);

						var node_9 = $.sibling(div, 2);

						$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
							Layout_Stack_2($$anchor, {
								gap: 'xl',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_5();
									var node_10 = $.first_child(fragment_7);

									$.component(node_10, () => Typography.Title, ($$anchor, Typography_Title) => {
										Typography_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Integrations');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
										Layout_Stack_3($$anchor, {
											gap: 'xl',
											direction: 'row',
											justifyContent: 'space-between',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_12 = $.first_child(fragment_8);

												Tabs(node_12, {
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_13 = $.first_child(fragment_9);

														$.each(node_13, 17, () => $.get(integrationTabs), $.index, ($$anchor, tab) => {
															{
																let $0 = $.derived(() => isTabSelected($.get(tab), page.url.pathname, $.get(path), $.get(integrationTabs)));

																Tab($$anchor, {
																	noscroll: true,
																	get href() {
																		return $.get(tab).href;
																	},

																	get event() {
																		return $.get(tab).event;
																	},

																	get selected() {
																		return $.get($0);
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text();

																		$.template_effect(() => $.set_text(text_1, $.get(tab).title));
																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															}
														});

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});

												var node_14 = $.sibling(node_12, 2);

												{
													var consequent_1 = ($$anchor) => {
														var fragment_12 = $.comment();
														var node_15 = $.first_child(fragment_12);

														$.component(node_15, $action, ($$anchor, $$component) => {
															$$component($$anchor, {});
														});

														$.append($$anchor, fragment_12);
													};

													$.if(node_14, ($$render) => {
														if ($action()) $$render(consequent_1);
													});
												}

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_11, 2);

									$.slot(node_16, $$props, 'default', {}, null);
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}