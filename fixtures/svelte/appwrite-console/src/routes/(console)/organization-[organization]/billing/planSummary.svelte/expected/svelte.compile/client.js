import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { EstimatedCard, Pagination as PaginationComponent } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { toLocaleDate } from '$lib/helpers/date';
import { getChangePlanUrl } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import { formatCurrency } from '$lib/helpers/numbers';
import { DEFAULT_BILLING_PROJECTS_LIMIT } from '$lib/constants';
import { Click, trackEvent } from '$lib/actions/analytics';

import {
	Typography,
	AccordionTable,
	Icon,
	Layout,
	Divider,
	Badge,
	Tooltip
} from '@appwrite.io/pink-svelte';

import { humanFileSize } from '$lib/helpers/sizeConvertion';
import { formatNum } from '$lib/helpers/string';
import { ProgressBar } from '$lib/components';
import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
import CancelDowngradeModel from './cancelDowngradeModal.svelte';
import { IconTag } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';

var root_1 = $.from_html(`Next payment of <span class="text --fgcolor-neutral-primary u-bold"> </span> will occur on <span class="text --fgcolor-neutral-primary u-bold"> </span>.`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="cell-item-text svelte-v1pleg"><!></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div><div class="usage-progress-section svelte-v1pleg"><!></div> <div class="usage-text-section svelte-v1pleg"><!></div></div>`);
var root_6 = $.from_html(`<div class="pagination-left svelte-v1pleg"><!></div>`);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<div><!></div>`);
var root_9 = $.from_html(`<!> <!> <!> <div class="billing-cycle-header svelte-v1pleg"><!> <!></div> <div><!></div> <div class="actions-container"><!></div>`, 1);

export default function PlanSummary($$anchor, $$props) {
	$.push($$props, true);

	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $isTabletViewport = () => $.store_get(isTabletViewport, '$isTabletViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let nextPlan = $.prop($$props, 'nextPlan', 3, null),
		availableCredit = $.prop($$props, 'availableCredit', 3, undefined),
		currentAggregation = $.prop($$props, 'currentAggregation', 3, undefined),
		limit = $.prop($$props, 'limit', 3, undefined),
		offset = $.prop($$props, 'offset', 3, undefined);

	let showCancel = $.state(false);

	// define columns for the accordion table
	const columns = [
		{ id: 'item', align: 'left', width: { min: 200 } },
		{ id: 'usage', align: 'left', width: { min: 500 } },
		{ id: 'price', align: 'right', width: { min: 100 } }
	];

	const projectsLimit = $.derived(() => limit() ?? (Number(page.url.searchParams.get('limit')) || DEFAULT_BILLING_PROJECTS_LIMIT));
	const projectsOffset = $.derived(() => offset() ?? ((Number(page.url.searchParams.get('page')) || 1) - 1) * $.get(projectsLimit));
	const projectBreakdownCount = $.derived(() => currentAggregation()?.breakdown?.length ?? 0);
	const hasProjectBreakdown = $.derived(() => $.get(projectBreakdownCount) > 0);
	const totalProjects = $.derived(() => (currentAggregation()?.resources?.find?.((r) => r.resourceId === 'projects')?.value ?? null) || $.get(projectBreakdownCount) || 0);
	const aggregationKey = $.derived(() => `agg:${Number(page.url.searchParams.get('page')) || 1}:${$.get(projectsLimit)}`);
	const billingData = $.derived(() => getBillingData($$props.currentPlan, currentAggregation(), $isSmallViewport()));
	const baseAmount = $.derived(() => currentAggregation()?.amount ?? $$props.currentPlan?.price ?? 0);
	const creditsApplied = $.derived(() => Math.min($.get(baseAmount), availableCredit() ?? 0));
	const totalAmount = $.derived(() => Math.max($.get(baseAmount) - $.get(creditsApplied), 0));
	const isUpgrading = $.derived(() => $organization()?.status === 'upgrading');

	function formatHumanSize(bytes) {
		const size = humanFileSize(bytes || 0);

		return `${size.value} ${size.unit}`;
	}

	function formatBandwidthUsage(currentBytes, maxGB) {
		const currentSize = humanFileSize(currentBytes || 0);

		if (!maxGB) {
			return `${currentSize.value} ${currentSize.unit} / Unlimited`;
		}

		const maxSize = humanFileSize(maxGB * 1000 * 1000 * 1000);

		return `${currentSize.value} ${currentSize.unit} / ${maxSize.value} ${maxSize.unit}`;
	}

	function truncateForSmall(name) {
		if (!name) return name;

		return name.length > 12 ? `${name.slice(0, 12)}…` : name;
	}

	function createProgressData(currentValue, maxValue) {
		if (maxValue === null || maxValue === undefined || typeof maxValue === 'number' && maxValue <= 0) {
			return [];
		}

		const max = typeof maxValue === 'string' ? parseFloat(maxValue) : maxValue;

		if (max <= 0) return [];

		const percentage = Math.min(currentValue / max * 100, 100);
		const progressColor = 'var(--bgcolor-neutral-invert)';

		return [
			{
				size: currentValue,
				color: progressColor,
				tooltip: {
					title: `${percentage.toFixed(1)}% used`,
					label: `${currentValue.toLocaleString()} of ${max.toLocaleString()}`
				}
			}
		];
	}

	function createStorageProgressData(currentBytes, maxGB) {
		if (maxGB <= 0) return [];

		const maxBytes = maxGB * 1000 * 1000 * 1000;
		const percentage = Math.min(currentBytes / maxBytes * 100, 100);
		const progressColor = 'var(--bgcolor-neutral-invert)';
		const currentSize = humanFileSize(currentBytes);

		return [
			{
				size: currentBytes,
				color: progressColor,
				tooltip: {
					title: `${percentage.toFixed(0)}% used`,
					label: `${currentSize.value} ${currentSize.unit} of ${maxGB} GB`
				}
			}
		];
	}

	function createBandwidthProgressData(totalBytes, realtimeBytes, maxGB) {
		if (maxGB <= 0) return [];

		const maxBytes = maxGB * 1000 * 1000 * 1000;
		const percentage = Math.min(totalBytes / maxBytes * 100, 100);
		const showRealtimeSegment = realtimeBytes > 0 && realtimeBytes <= totalBytes;
		const realtimePortion = showRealtimeSegment ? realtimeBytes : 0;
		const regularPortion = Math.max(0, totalBytes - realtimePortion);
		const regularSize = humanFileSize(regularPortion);
		const realtimeSize = humanFileSize(realtimePortion);
		const segments = [];

		if (regularPortion > 0) {
			segments.push({
				size: regularPortion,
				color: 'var(--bgcolor-neutral-invert)',
				tooltip: {
					title: `${percentage.toFixed(0)}% used`,
					label: `Bandwidth: ${regularSize.value} ${regularSize.unit}`
				}
			});
		}

		if (realtimePortion > 0) {
			segments.push({
				size: realtimePortion,
				color: 'var(--bgcolor-neutral-invert-weak)',
				tooltip: {
					title: 'Realtime bandwidth',
					label: `${realtimeSize.value} ${realtimeSize.unit}`
				}
			});
		}

		return segments;
	}

	function getResource(resources, resourceId) {
		return resources?.find((resource) => resource.resourceId === resourceId);
	}

	function createRow(
		{
			id,
			label,
			resource,
			planLimit,
			formatValue = formatNum,
			usageFormatter,
			priceFormatter,
			progressFactory,
			maxFactory,
			includeProgress = true
		}
	) {
		const hasLimit = !!planLimit;
		const value = resource?.value || 0;
		const amount = resource?.amount || 0;

		const usage = usageFormatter
			? usageFormatter({ value, planLimit, resource, formatValue, hasLimit })
			: hasLimit
				? `${formatValue(value)} / ${formatValue(planLimit)}`
				: `${formatValue(value)} / Unlimited`;

		const price = priceFormatter
			? priceFormatter({ amount, resource })
			: formatCurrency(amount);

		const progressData = includeProgress
			? progressFactory
				? progressFactory({ value, planLimit, resource, hasLimit })
				: hasLimit ? createProgressData(value, planLimit) : []
			: undefined;

		const maxValue = includeProgress
			? maxFactory
				? maxFactory({ planLimit, hasLimit, resource })
				: hasLimit ? planLimit || null : null
			: undefined;

		const row = { id, cells: { item: label, usage, price } };

		if (includeProgress) {
			row.progressData = progressData;
			row.maxValue = maxValue ?? null;
		}

		return row;
	}

	function createResourceRow(id, label, resource, planLimit, formatValue = formatNum) {
		return createRow({ id, label, resource, planLimit, formatValue });
	}

	function getBillingData(currentPlan, currentAggregation, isSmallViewport) {
		// base plan row
		const basePlan = {
			id: 'base-plan',
			expandable: false,
			cells: {
				item: 'Base plan',
				usage: '',
				price: formatCurrency(nextPlan()?.price ?? currentPlan?.price ?? 0)
			},
			badge: null,
			children: []
		};

		// addons (additional members, projects, etc.)
		// Fallback labels for older cloud builds that don't yet send `addon.name`
		// on the resource entry. Once the cloud rollout is complete this map can
		// be removed entirely.
		const billingAddonNamesFallback = {
			addon_baa: 'HIPAA BAA',
			addon_premiumGeoDB: 'Premium Geo DB',
			addon_premiumGeoDBOrg: 'Premium Geo DB'
		};

		const addons = (currentAggregation?.resources || []).filter((r) => r.amount > 0 && (currentPlan?.addons?.[r.resourceId]?.price > 0 || r.resourceId.startsWith('addon_'))).map((addon) => ({
			id: `addon-${addon.resourceId}`,
			expandable: false,
			cells: {
				item: addon.resourceId === 'seats'
					? 'Additional members'
					: addon.resourceId === 'projects'
						? 'Additional projects'
						: addon.name || billingAddonNamesFallback[addon.resourceId] || addon.resourceId,
				usage: '',
				price: formatCurrency(addon.amount)
			},
			badge: addon.resourceId === 'projects' ? formatNum(addon.value) : null,
			children: []
		}));

		// project breakdown rows
		const projects = (currentAggregation?.breakdown || []).map((projectData) => {
			const resources = projectData.resources || [];
			const bandwidth = getResource(resources, 'bandwidth');
			const realtimeBandwidth = getResource(resources, 'realtimeBandwidth');
			const storage = getResource(resources, 'storage');
			const authPhone = getResource(resources, 'authPhone');
			const bandwidthValue = bandwidth?.value || 0;
			const realtimeBandwidthValue = realtimeBandwidth?.value || 0;

			return {
				id: `project-${projectData.$id}`,
				expandable: true,
				cells: {
					item: isSmallViewport
						? truncateForSmall(projectData.name)
						: projectData.name || `Project ${projectData.$id}`,
					usage: '',
					price: formatCurrency(projectData.amount || 0)
				},
				badge: null,
				children: [
					createRow({
						id: 'bandwidth',
						label: 'Bandwidth',
						resource: bandwidth,
						planLimit: currentPlan?.bandwidth,
						usageFormatter: ({ value, planLimit, hasLimit }) => formatBandwidthUsage(value, hasLimit ? planLimit ?? undefined : undefined),
						priceFormatter: ({ amount }) => formatCurrency(amount),
						progressFactory: ({ value, planLimit, hasLimit }) => hasLimit
							? createBandwidthProgressData(value, realtimeBandwidthValue, planLimit || 0)
							: [],
						maxFactory: ({ planLimit, hasLimit }) => hasLimit ? (planLimit || 0) * 1000 * 1000 * 1000 : null
					}),

					...realtimeBandwidthValue > bandwidthValue
						? [
							createRow({
								id: 'realtime-bandwidth',
								label: 'Realtime bandwidth',
								resource: realtimeBandwidth,
								usageFormatter: ({ value }) => {
									const size = humanFileSize(value);

									return `${size.value} ${size.unit}`;
								},
								priceFormatter: ({ amount }) => formatCurrency(amount),
								includeProgress: false
							})
						]
						: [],

					// standard resources (numeric)
					createResourceRow('users', 'Users', getResource(resources, 'users'), currentPlan?.users),
					createResourceRow('reads', 'Database reads', getResource(resources, 'databasesReads'), currentPlan?.databasesReads),
					createResourceRow('writes', 'Database writes', getResource(resources, 'databasesWrites'), currentPlan?.databasesWrites),
					createResourceRow('executions', 'Executions', getResource(resources, 'executions'), currentPlan?.executions),
					createRow({
						id: 'storage',
						label: 'Storage',
						resource: storage,
						planLimit: currentPlan?.storage,
						usageFormatter: ({ value, planLimit, hasLimit }) => hasLimit
							? `${formatHumanSize(value)} / ${planLimit?.toString() || '0'} GB`
							: `${formatHumanSize(value)} / Unlimited`,
						priceFormatter: ({ amount }) => formatCurrency(amount),
						progressFactory: ({ value, planLimit, hasLimit }) => hasLimit ? createStorageProgressData(value, planLimit || 0) : [],
						maxFactory: ({ planLimit, hasLimit }) => hasLimit ? (planLimit || 0) * 1000 * 1000 * 1000 : null
					}),
					createResourceRow('image-transformations', 'Image transformations', getResource(resources, 'imageTransformations'), currentPlan?.imageTransformations),
					createResourceRow('screenshots-generated', 'Screenshots generated', getResource(resources, 'screenshotsGenerated'), currentPlan?.screenshotsGenerated),
					createResourceRow('gb-hours', 'GB-hours', getResource(resources, 'GBHours'), currentPlan?.GBHours),
					createResourceRow('realtime', 'Realtime connections', getResource(resources, 'realtime'), currentPlan?.realtime),
					createResourceRow('realtime-messages', 'Realtime messages', getResource(resources, 'realtimeMessages'), currentPlan?.realtimeMessages),
					createRow({
						id: 'sms',
						label: 'Phone OTP',
						resource: authPhone,
						usageFormatter: ({ value }) => `${formatNum(value)} SMS messages`,
						priceFormatter: ({ amount }) => formatCurrency(amount),
						includeProgress: false
					}),

					...resources.filter((r) => r.resourceId?.startsWith('addon_') && (r.amount ?? 0) > 0).map((addon) => createRow({
						id: `addon-${addon.resourceId}`,
						label: addon.name || billingAddonNamesFallback[addon.resourceId] || addon.resourceId,
						resource: addon,
						usageFormatter: ({ value }) => formatNum(value),
						priceFormatter: ({ amount }) => formatCurrency(amount),
						includeProgress: false
					})),

					createRow({
						id: 'usage-details',
						label: `<a href="${base}/project-${String(projectData.region || 'default')}-${projectData.$id}/settings/usage" style="text-decoration: underline; color: var(--fgcolor-accent-neutral);">Usage details</a>`,
						usageFormatter: () => '',
						priceFormatter: () => '',
						includeProgress: false
					})
				]
			};
		});

		return [basePlan, ...addons, ...projects];
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent_12 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => $.get(aggregationKey), ($$anchor) => {
				EstimatedCard($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_9();
						var node_2 = $.first_child(fragment_3);

						$.component(node_2, () => Typography.Title, ($$anchor, Typography_Title) => {
							Typography_Title($$anchor, {
								size: 's',
								gap: 's',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, `${$$props.currentPlan.name ?? ''} plan`));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						{
							var consequent = ($$anchor) => {
								var fragment_5 = $.comment();
								var node_4 = $.first_child(fragment_5);

								$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text) => {
									Typography_Text($$anchor, {
										color: '--fgcolor-neutral-secondary',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_6 = root_1();
											var span = $.sibling($.first_child(fragment_6));
											var text_1 = $.only_child(span, true);
											var span_1 = $.sibling(span, 2);
											var text_2 = $.only_child(span_1, true);

											$.next();

											$.template_effect(
												($0, $1) => {
													$.set_text(text_1, $0);
													$.set_text(text_2, $1);
												},
												[
													() => formatCurrency($.get(totalAmount)),
													() => toLocaleDate($organization()?.billingNextInvoiceDate)
												]
											);

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							};

							$.if(node_3, ($$render) => {
								if ($.get(totalAmount) > 0) $$render(consequent);
							});
						}

						var node_5 = $.sibling(node_3, 2);

						Divider(node_5, {});

						var div = $.sibling(node_5, 2);
						var node_6 = $.child(div);

						$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text_1) => {
							Typography_Text_1($$anchor, {
								color: '--fgcolor-neutral-secondary',
								variant: 'm-500',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text();

									$.template_effect(($0, $1) => $.set_text(text_3, `Current billing cycle (${$0 ?? ''}-${$1 ?? ''})`), [
										() => new Date($organization()?.billingCurrentInvoiceDate).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
										() => new Date($organization()?.billingNextInvoiceDate).toLocaleDateString('en', { day: 'numeric', month: 'short' })
									]);

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text_2) => {
							Typography_Text_2($$anchor, {
								color: '--fgcolor-neutral-tertiary',
								variant: 'm-400',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Estimate, subject to change based on usage.');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div);

						var div_1 = $.sibling(div, 2);
						let classes;
						var node_8 = $.child(div_1);

						$.component(node_8, () => AccordionTable.Root, ($$anchor, AccordionTable_Root) => {
							AccordionTable_Root($$anchor, {
								get columns() {
									return columns;
								},
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$anchor, $$slotProps) => {
										const root = $.derived(() => $$slotProps.root);
										var fragment_8 = root_7();
										var node_9 = $.first_child(fragment_8);

										$.each(node_9, 17, () => $.get(billingData), $.index, ($$anchor, row) => {
											var fragment_9 = $.comment();
											var node_10 = $.first_child(fragment_9);

											{
												let $0 = $.derived(() => $.get(row).expandable ?? false);

												$.component(node_10, () => AccordionTable.Row, ($$anchor, AccordionTable_Row) => {
													AccordionTable_Row($$anchor, {
														get root() {
															return $.get(root);
														},

														get id() {
															return $.get(row).id;
														},

														get expandable() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_10 = $.comment();
															var node_11 = $.first_child(fragment_10);

															$.each(node_11, 17, () => columns, $.index, ($$anchor, col) => {
																var fragment_11 = $.comment();
																var node_12 = $.first_child(fragment_11);

																$.component(node_12, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell) => {
																	AccordionTable_Cell($$anchor, {
																		get root() {
																			return $.get(root);
																		},

																		get column() {
																			return $.get(col).id;
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_12 = $.comment();
																			var node_13 = $.first_child(fragment_12);

																			{
																				var consequent_2 = ($$anchor) => {
																					var div_2 = root_3();
																					var node_14 = $.child(div_2);

																					{
																						var consequent_1 = ($$anchor) => {
																							var fragment_13 = $.comment();
																							var node_15 = $.first_child(fragment_13);

																							$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack) => {
																								Layout_Stack($$anchor, {
																									direction: 'row',
																									alignItems: 'center',
																									gap: 'xs',
																									children: ($$anchor, $$slotProps) => {
																										var fragment_14 = root_2();
																										var node_16 = $.first_child(fragment_14);

																										$.component(node_16, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																											Typography_Text_3($$anchor, {
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_5 = $.text();

																													$.template_effect(() => $.set_text(text_5, $.get(row).cells?.[$.get(col).id] ?? ''));
																													$.append($$anchor, text_5);
																												},
																												$$slots: { default: true }
																											});
																										});

																										var node_17 = $.sibling(node_16, 2);

																										Badge(node_17, {
																											variant: 'secondary',
																											size: 'xs',
																											get content() {
																												return $.get(row).badge;
																											}
																										});

																										$.append($$anchor, fragment_14);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_13);
																						};

																						var alternate = ($$anchor) => {
																							var fragment_16 = $.comment();
																							var node_18 = $.first_child(fragment_16);

																							$.component(node_18, () => Typography.Text, ($$anchor, Typography_Text_4) => {
																								Typography_Text_4($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_6 = $.text();

																										$.template_effect(() => $.set_text(text_6, $.get(row).cells?.[$.get(col).id] ?? ''));
																										$.append($$anchor, text_6);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_16);
																						};

																						$.if(node_14, ($$render) => {
																							if ($.get(row).badge) $$render(consequent_1); else $$render(alternate, -1);
																						});
																					}

																					$.reset(div_2);
																					$.append($$anchor, div_2);
																				};

																				var alternate_1 = ($$anchor) => {
																					var fragment_18 = $.comment();
																					var node_19 = $.first_child(fragment_18);

																					$.component(node_19, () => Typography.Text, ($$anchor, Typography_Text_5) => {
																						Typography_Text_5($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_7 = $.text();

																								$.template_effect(() => $.set_text(text_7, $.get(row).cells?.[$.get(col).id] ?? ''));
																								$.append($$anchor, text_7);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_18);
																				};

																				$.if(node_13, ($$render) => {
																					if ($.get(col).id === 'item') $$render(consequent_2); else $$render(alternate_1, -1);
																				});
																			}

																			$.append($$anchor, fragment_12);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_11);
															});

															$.append($$anchor, fragment_10);
														},

														$$slots: {
															default: true,
															summary: ($$anchor, $$slotProps) => {
																const root = $.derived(() => $$slotProps.root);
																var fragment_20 = $.comment();
																var node_20 = $.first_child(fragment_20);

																{
																	var consequent_6 = ($$anchor) => {
																		var fragment_21 = $.comment();
																		var node_21 = $.first_child(fragment_21);

																		$.each(node_21, 17, () => $.get(row).children, (child) => child.id, ($$anchor, child) => {
																			var fragment_22 = $.comment();
																			var node_22 = $.first_child(fragment_22);

																			$.component(node_22, () => AccordionTable.Summary.Row, ($$anchor, AccordionTable_Summary_Row) => {
																				AccordionTable_Summary_Row($$anchor, {
																					get root() {
																						return $.get(root);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_23 = root_4();
																						var node_23 = $.first_child(fragment_23);

																						$.component(node_23, () => AccordionTable.Summary.Cell, ($$anchor, AccordionTable_Summary_Cell) => {
																							AccordionTable_Summary_Cell($$anchor, {
																								get root() {
																									return $.get(root);
																								},
																								column: 'item',
																								alignment: 'middle-start',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_24 = $.comment();
																									var node_24 = $.first_child(fragment_24);

																									{
																										var consequent_3 = ($$anchor) => {
																											var fragment_25 = $.comment();
																											var node_25 = $.first_child(fragment_25);

																											$.html(node_25, () => $.get(child).cells?.item ?? '');
																											$.append($$anchor, fragment_25);
																										};

																										var d = $.derived(() => $.get(child).cells?.item?.includes('<a href='));

																										var alternate_2 = ($$anchor) => {
																											var fragment_26 = $.comment();
																											var node_26 = $.first_child(fragment_26);

																											$.component(node_26, () => Typography.Text, ($$anchor, Typography_Text_6) => {
																												Typography_Text_6($$anchor, {
																													variant: 'm-400',
																													color: '--fgcolor-neutral-secondary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_8 = $.text();

																														$.template_effect(() => $.set_text(text_8, $.get(child).cells?.item ?? ''));
																														$.append($$anchor, text_8);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_26);
																										};

																										$.if(node_24, ($$render) => {
																											if ($.get(d)) $$render(consequent_3); else $$render(alternate_2, -1);
																										});
																									}

																									$.append($$anchor, fragment_24);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_27 = $.sibling(node_23, 2);

																						$.component(node_27, () => AccordionTable.Summary.Cell, ($$anchor, AccordionTable_Summary_Cell_1) => {
																							AccordionTable_Summary_Cell_1($$anchor, {
																								get root() {
																									return $.get(root);
																								},
																								column: 'usage',
																								alignment: 'middle-start',
																								children: ($$anchor, $$slotProps) => {
																									var div_3 = root_5();
																									let classes_1;
																									var div_4 = $.child(div_3);
																									var node_28 = $.child(div_4);

																									{
																										var consequent_4 = ($$anchor) => {
																											ProgressBar($$anchor, {
																												get maxSize() {
																													return $.get(child).maxValue;
																												},

																												get data() {
																													return $.get(child).progressData;
																												}
																											});
																										};

																										$.if(node_28, ($$render) => {
																											if ($.get(child).progressData && $.get(child).progressData.length > 0 && $.get(child).maxValue) $$render(consequent_4);
																										});
																									}

																									$.reset(div_4);

																									var div_5 = $.sibling(div_4, 2);
																									var node_29 = $.child(div_5);

																									{
																										var consequent_5 = ($$anchor) => {
																											const usageParts = $.derived(() => ($.get(child).cells?.usage ?? '').split(' / '));
																											var fragment_29 = root_4();
																											var node_30 = $.first_child(fragment_29);

																											$.component(node_30, () => Typography.Text, ($$anchor, Typography_Text_7) => {
																												Typography_Text_7($$anchor, {
																													variant: 'm-400',
																													color: '--fgcolor-neutral-secondary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_9 = $.text();

																														$.template_effect(() => $.set_text(text_9, $.get(usageParts)[0]));
																														$.append($$anchor, text_9);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_31 = $.sibling(node_30, 2);

																											$.component(node_31, () => Typography.Text, ($$anchor, Typography_Text_8) => {
																												Typography_Text_8($$anchor, {
																													variant: 'm-400',
																													color: '--fgcolor-neutral-tertiary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_10 = $.text();

																														text_10.nodeValue = ' / ';
																														$.append($$anchor, text_10);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_32 = $.sibling(node_31, 2);

																											$.component(node_32, () => Typography.Text, ($$anchor, Typography_Text_9) => {
																												Typography_Text_9($$anchor, {
																													variant: 'm-400',
																													color: '--fgcolor-neutral-tertiary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_11 = $.text();

																														$.template_effect(() => $.set_text(text_11, $.get(usageParts)[1]));
																														$.append($$anchor, text_11);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_29);
																										};

																										var d_1 = $.derived(() => $.get(child).cells?.usage?.includes(' / '));

																										var alternate_3 = ($$anchor) => {
																											var fragment_33 = $.comment();
																											var node_33 = $.first_child(fragment_33);

																											$.component(node_33, () => Typography.Text, ($$anchor, Typography_Text_10) => {
																												Typography_Text_10($$anchor, {
																													variant: 'm-400',
																													color: '--fgcolor-neutral-secondary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_12 = $.text();

																														$.template_effect(() => $.set_text(text_12, $.get(child).cells?.usage ?? ''));
																														$.append($$anchor, text_12);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_33);
																										};

																										$.if(node_29, ($$render) => {
																											if ($.get(d_1)) $$render(consequent_5); else $$render(alternate_3, -1);
																										});
																									}

																									$.reset(div_5);
																									$.reset(div_3);

																									$.template_effect(() => classes_1 = $.set_class(div_3, 1, 'usage-cell-content svelte-v1pleg', null, classes_1, {
																										'is-mobile': $isSmallViewport(),
																										'is-tablet': $isTabletViewport() && !$isSmallViewport()
																									}));

																									$.append($$anchor, div_3);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_34 = $.sibling(node_27, 2);

																						$.component(node_34, () => AccordionTable.Summary.Cell, ($$anchor, AccordionTable_Summary_Cell_2) => {
																							AccordionTable_Summary_Cell_2($$anchor, {
																								get root() {
																									return $.get(root);
																								},
																								column: 'price',
																								alignment: 'middle-end',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_35 = $.comment();
																									var node_35 = $.first_child(fragment_35);

																									$.component(node_35, () => Typography.Text, ($$anchor, Typography_Text_11) => {
																										Typography_Text_11($$anchor, {
																											variant: 'm-400',
																											color: '--fgcolor-neutral-secondary',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_13 = $.text();

																												$.template_effect(() => $.set_text(text_13, $.get(child).cells?.price ?? ''));
																												$.append($$anchor, text_13);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_35);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_23);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_22);
																		});

																		$.append($$anchor, fragment_21);
																	};

																	$.if(node_20, ($$render) => {
																		if ($.get(row).children) $$render(consequent_6);
																	});
																}

																$.append($$anchor, fragment_20);
															}
														}
													});
												});
											}

											$.append($$anchor, fragment_9);
										});

										var node_36 = $.sibling(node_9, 2);

										{
											var consequent_7 = ($$anchor) => {
												var fragment_37 = $.comment();
												var node_37 = $.first_child(fragment_37);

												$.component(node_37, () => AccordionTable.Row, ($$anchor, AccordionTable_Row_1) => {
													AccordionTable_Row_1($$anchor, {
														get root() {
															return $.get(root);
														},
														id: 'pagination-row',
														expandable: false,
														children: ($$anchor, $$slotProps) => {
															var fragment_38 = root_4();
															var node_38 = $.first_child(fragment_38);

															$.component(node_38, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell_1) => {
																AccordionTable_Cell_1($$anchor, {
																	get root() {
																		return $.get(root);
																	},
																	column: 'item',
																	children: ($$anchor, $$slotProps) => {
																		var div_6 = root_6();
																		var node_39 = $.child(div_6);

																		PaginationComponent(node_39, {
																			get limit() {
																				return $.get(projectsLimit);
																			},

																			get offset() {
																				return $.get(projectsOffset);
																			},

																			get sum() {
																				return $.get(totalProjects);
																			}
																		});

																		$.reset(div_6);
																		$.append($$anchor, div_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_40 = $.sibling(node_38, 2);

															$.component(node_40, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell_2) => {
																AccordionTable_Cell_2($$anchor, {
																	get root() {
																		return $.get(root);
																	},
																	column: 'usage'
																});
															});

															var node_41 = $.sibling(node_40, 2);

															$.component(node_41, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell_3) => {
																AccordionTable_Cell_3($$anchor, {
																	get root() {
																		return $.get(root);
																	},
																	column: 'price'
																});
															});

															$.append($$anchor, fragment_38);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_37);
											};

											$.if(node_36, ($$render) => {
												if ($.get(totalProjects) > $.get(projectsLimit) && $.get(hasProjectBreakdown)) $$render(consequent_7);
											});
										}

										var node_42 = $.sibling(node_36, 2);

										{
											var consequent_8 = ($$anchor) => {
												var fragment_39 = $.comment();
												var node_43 = $.first_child(fragment_39);

												$.component(node_43, () => AccordionTable.Row, ($$anchor, AccordionTable_Row_2) => {
													AccordionTable_Row_2($$anchor, {
														get root() {
															return $.get(root);
														},
														id: 'credits-row',
														expandable: false,
														children: ($$anchor, $$slotProps) => {
															var fragment_40 = root_4();
															var node_44 = $.first_child(fragment_40);

															$.component(node_44, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell_4) => {
																AccordionTable_Cell_4($$anchor, {
																	get root() {
																		return $.get(root);
																	},
																	column: 'item',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_41 = $.comment();
																		var node_45 = $.first_child(fragment_41);

																		$.component(node_45, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
																			Layout_Stack_1($$anchor, {
																				inline: true,
																				direction: 'row',
																				gap: 'xxs',
																				alignItems: 'center',
																				alignContent: 'center',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_42 = root_2();
																					var node_46 = $.first_child(fragment_42);

																					Icon(node_46, {
																						get icon() {
																							return IconTag;
																						},
																						color: '--fgcolor-success',
																						size: 's'
																					});

																					var node_47 = $.sibling(node_46, 2);

																					$.component(node_47, () => Typography.Text, ($$anchor, Typography_Text_12) => {
																						Typography_Text_12($$anchor, {
																							color: '--fgcolor-neutral-primary',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_14 = $.text('Credits');

																								$.append($$anchor, text_14);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_42);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_41);
																	},
																	$$slots: { default: true }
																});
															});

															var node_48 = $.sibling(node_44, 2);

															$.component(node_48, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell_5) => {
																AccordionTable_Cell_5($$anchor, {
																	get root() {
																		return $.get(root);
																	},
																	column: 'usage',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_43 = $.comment();
																		var node_49 = $.first_child(fragment_43);

																		$.component(node_49, () => Typography.Text, ($$anchor, Typography_Text_13) => {
																			Typography_Text_13($$anchor, { variant: 'm-500', color: '--fgcolor-neutral-primary' });
																		});

																		$.append($$anchor, fragment_43);
																	},
																	$$slots: { default: true }
																});
															});

															var node_50 = $.sibling(node_48, 2);

															$.component(node_50, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell_6) => {
																AccordionTable_Cell_6($$anchor, {
																	get root() {
																		return $.get(root);
																	},
																	column: 'price',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_44 = $.comment();
																		var node_51 = $.first_child(fragment_44);

																		$.component(node_51, () => Typography.Text, ($$anchor, Typography_Text_14) => {
																			Typography_Text_14($$anchor, {
																				variant: 'm-500',
																				color: '--fgcolor-neutral-primary',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_15 = $.text();

																					$.template_effect(($0) => $.set_text(text_15, `-${$0 ?? ''}`), [() => formatCurrency($.get(creditsApplied))]);
																					$.append($$anchor, text_15);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_44);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_40);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_39);
											};

											$.if(node_42, ($$render) => {
												if (availableCredit() > 0) $$render(consequent_8);
											});
										}

										var node_52 = $.sibling(node_42, 2);

										$.component(node_52, () => AccordionTable.Row, ($$anchor, AccordionTable_Row_3) => {
											AccordionTable_Row_3($$anchor, {
												get root() {
													return $.get(root);
												},
												id: 'total-row',
												expandable: false,
												children: ($$anchor, $$slotProps) => {
													var fragment_46 = root_4();
													var node_53 = $.first_child(fragment_46);

													$.component(node_53, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell_7) => {
														AccordionTable_Cell_7($$anchor, {
															get root() {
																return $.get(root);
															},
															column: 'item',
															children: ($$anchor, $$slotProps) => {
																var fragment_47 = $.comment();
																var node_54 = $.first_child(fragment_47);

																$.component(node_54, () => Typography.Text, ($$anchor, Typography_Text_15) => {
																	Typography_Text_15($$anchor, {
																		variant: 'm-500',
																		color: '--fgcolor-neutral-primary',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_16 = $.text('Total');

																			$.append($$anchor, text_16);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_47);
															},
															$$slots: { default: true }
														});
													});

													var node_55 = $.sibling(node_53, 2);

													$.component(node_55, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell_8) => {
														AccordionTable_Cell_8($$anchor, {
															get root() {
																return $.get(root);
															},
															column: 'usage',
															children: ($$anchor, $$slotProps) => {
																var fragment_48 = $.comment();
																var node_56 = $.first_child(fragment_48);

																$.component(node_56, () => Typography.Text, ($$anchor, Typography_Text_16) => {
																	Typography_Text_16($$anchor, { variant: 'm-500', color: '--fgcolor-neutral-primary' });
																});

																$.append($$anchor, fragment_48);
															},
															$$slots: { default: true }
														});
													});

													var node_57 = $.sibling(node_55, 2);

													$.component(node_57, () => AccordionTable.Cell, ($$anchor, AccordionTable_Cell_9) => {
														AccordionTable_Cell_9($$anchor, {
															get root() {
																return $.get(root);
															},
															column: 'price',
															children: ($$anchor, $$slotProps) => {
																var fragment_49 = $.comment();
																var node_58 = $.first_child(fragment_49);

																$.component(node_58, () => Typography.Text, ($$anchor, Typography_Text_17) => {
																	Typography_Text_17($$anchor, {
																		variant: 'm-500',
																		color: '--fgcolor-neutral-primary',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_17 = $.text();

																			$.template_effect(($0) => $.set_text(text_17, $0), [() => formatCurrency($.get(totalAmount))]);
																			$.append($$anchor, text_17);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_49);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_46);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									}
								}
							});
						});

						$.reset(div_1);

						var div_7 = $.sibling(div_1, 2);
						var node_59 = $.child(div_7);

						$.component(node_59, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
							Layout_Stack_2($$anchor, {
								direction: 'row',
								alignItems: 'center',
								justifyContent: 'flex-end',
								gap: 's',
								wrap: 'wrap',
								class: 'u-width-full-line actions-mobile',
								children: ($$anchor, $$slotProps) => {
									var fragment_51 = root_2();
									var node_60 = $.first_child(fragment_51);

									{
										let $0 = $.derived(() => !$.get(isUpgrading));

										Tooltip(node_60, {
											get disabled() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var div_8 = root_8();
												var node_61 = $.child(div_8);

												{
													var consequent_9 = ($$anchor) => {
														{
															let $0 = $.derived(() => $organization()?.markedForDeletion || $.get(isUpgrading));
															let $1 = $.derived(() => getChangePlanUrl($organization()?.$id));

															Button($$anchor, {
																text: true,
																get disabled() {
																	return $.get($0);
																},

																get href() {
																	return $.get($1);
																},

																$$events: {
																	click: () => trackEvent(Click.OrganizationClickUpgrade, { from: 'button', source: 'billing_tab' })
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_18 = $.text('Upgrade');

																	$.append($$anchor, text_18);
																},
																$$slots: { default: true }
															});
														}
													};

													var consequent_10 = ($$anchor) => {
														Button($$anchor, {
															text: true,
															get disabled() {
																return $.get(isUpgrading);
															},
															$$events: { click: () => $.set(showCancel, true) },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_19 = $.text('Cancel change');

																$.append($$anchor, text_19);
															},
															$$slots: { default: true }
														});
													};

													var alternate_4 = ($$anchor) => {
														{
															let $0 = $.derived(() => $organization()?.markedForDeletion || $.get(isUpgrading));
															let $1 = $.derived(() => getChangePlanUrl($organization()?.$id));

															Button($$anchor, {
																text: true,
																get disabled() {
																	return $.get($0);
																},

																get href() {
																	return $.get($1);
																},

																$$events: {
																	click: () => trackEvent(Click.OrganizationClickUpgrade, { from: 'button', source: 'billing_tab' })
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_20 = $.text('Change plan');

																	$.append($$anchor, text_20);
																},
																$$slots: { default: true }
															});
														}
													};

													$.if(node_61, ($$render) => {
														if (!$$props.currentPlan.requiresPaymentMethod) $$render(consequent_9); else if ($organization()?.billingPlanDowngrade !== null) $$render(consequent_10, 1); else $$render(alternate_4, -1);
													});
												}

												$.reset(div_8);
												$.append($$anchor, div_8);
											},

											$$slots: {
												default: true,
												tooltip: ($$anchor, $$slotProps) => {
													var text_21 = $.text('Your payment is still being processed, check with your payment provider.');

													$.append($$anchor, text_21);
												}
											}
										});
									}

									var node_62 = $.sibling(node_60, 2);

									{
										var consequent_11 = ($$anchor) => {
											{
												let $0 = $.derived(() => !$$props.currentPlan.requiresPaymentMethod);
												let $1 = $.derived(() => `${base}/organization-${$organization()?.$id}/usage`);

												Button($$anchor, {
													get text() {
														return $.get($0);
													},

													get secondary() {
														return $$props.currentPlan.requiresPaymentMethod;
													},

													get href() {
														return $.get($1);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_22 = $.text('View estimated usage');

														$.append($$anchor, text_22);
													},
													$$slots: { default: true }
												});
											}
										};

										$.if(node_62, ($$render) => {
											if (!$$props.currentPlan?.usagePerProject) $$render(consequent_11);
										});
									}

									$.append($$anchor, fragment_51);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_7);
						$.template_effect(() => classes = $.set_class(div_1, 1, '', null, classes, { 'is-mobile': $isSmallViewport() }));
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($organization()) $$render(consequent_12);
		});
	}

	var node_63 = $.sibling(node, 2);

	CancelDowngradeModel(node_63, {
		get showCancel() {
			return $.get(showCancel);
		},

		set showCancel($$value) {
			$.set(showCancel, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}