import * as $ from 'svelte/internal/server';
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

export default function PlanSummary($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			currentPlan,
			nextPlan = null,
			availableCredit = undefined,
			currentAggregation = undefined,
			limit = undefined,
			offset = undefined
		} = $$props;

		let showCancel = false;

		// define columns for the accordion table
		const columns = [
			{ id: 'item', align: 'left', width: { min: 200 } },
			{ id: 'usage', align: 'left', width: { min: 500 } },
			{ id: 'price', align: 'right', width: { min: 100 } }
		];

		const projectsLimit = $.derived(() => limit ?? (Number(page.url.searchParams.get('limit')) || DEFAULT_BILLING_PROJECTS_LIMIT));
		const projectsOffset = $.derived(() => offset ?? ((Number(page.url.searchParams.get('page')) || 1) - 1) * projectsLimit());
		const projectBreakdownCount = $.derived(() => currentAggregation?.breakdown?.length ?? 0);
		const hasProjectBreakdown = $.derived(() => projectBreakdownCount() > 0);
		const totalProjects = $.derived(() => (currentAggregation?.resources?.find?.((r) => r.resourceId === 'projects')?.value ?? null) || projectBreakdownCount() || 0);
		const aggregationKey = $.derived(() => `agg:${Number(page.url.searchParams.get('page')) || 1}:${projectsLimit()}`);
		const billingData = $.derived(() => getBillingData(currentPlan, currentAggregation, $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)));
		const baseAmount = $.derived(() => currentAggregation?.amount ?? currentPlan?.price ?? 0);
		const creditsApplied = $.derived(() => Math.min(baseAmount(), availableCredit ?? 0));
		const totalAmount = $.derived(() => Math.max(baseAmount() - creditsApplied(), 0));
		const isUpgrading = $.derived(() => $.store_get($$store_subs ??= {}, '$organization', organization)?.status === 'upgrading');

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
					price: formatCurrency(nextPlan?.price ?? currentPlan?.price ?? 0)
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if ($.store_get($$store_subs ??= {}, '$organization', organization)) {
				$$renderer.push(`<!--[0--><!---->`);

				{
					EstimatedCard($$renderer, {
						children: ($$renderer) => {
							if (Typography.Title) {
								$$renderer.push('<!--[-->');

								Typography.Title($$renderer, {
									size: 's',
									gap: 's',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(currentPlan.name)} plan`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (totalAmount() > 0) {
								$$renderer.push('<!--[0-->');

								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										color: '--fgcolor-neutral-secondary',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Next payment of <span class="text --fgcolor-neutral-primary u-bold">${$.escape(formatCurrency(totalAmount()))}</span> will occur on <span class="text --fgcolor-neutral-primary u-bold">${$.escape(toLocaleDate($.store_get($$store_subs ??= {}, '$organization', organization)?.billingNextInvoiceDate))}</span>.`);
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

							$$renderer.push(`<!--]--> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> <div class="billing-cycle-header svelte-v1pleg">`);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									color: '--fgcolor-neutral-secondary',
									variant: 'm-500',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Current billing cycle (${$.escape(new Date($.store_get($$store_subs ??= {}, '$organization', organization)?.billingCurrentInvoiceDate).toLocaleDateString('en', { day: 'numeric', month: 'short' }))}-${$.escape(new Date($.store_get($$store_subs ??= {}, '$organization', organization)?.billingNextInvoiceDate).toLocaleDateString('en', { day: 'numeric', month: 'short' }))})`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									color: '--fgcolor-neutral-tertiary',
									variant: 'm-400',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Estimate, subject to change based on usage.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</div> <div${$.attr_class('', void 0, {
								'is-mobile': $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)
							})}>`);

							if (AccordionTable.Root) {
								$$renderer.push('<!--[-->');

								AccordionTable.Root($$renderer, {
									columns,
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$renderer, { root }) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(billingData());

											for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
												let row = each_array[$$index_2];

												if (AccordionTable.Row) {
													$$renderer.push('<!--[-->');

													AccordionTable.Row($$renderer, {
														root,
														id: row.id,
														expandable: row.expandable ?? false,
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_1 = $.ensure_array_like(columns);

															for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																let col = each_array_1[$$index];

																if (AccordionTable.Cell) {
																	$$renderer.push('<!--[-->');

																	AccordionTable.Cell($$renderer, {
																		root,
																		column: col.id,
																		children: ($$renderer) => {
																			if (col.id === 'item') {
																				$$renderer.push(`<!--[0--><div class="cell-item-text svelte-v1pleg">`);

																				if (row.badge) {
																					$$renderer.push('<!--[0-->');

																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							direction: 'row',
																							alignItems: 'center',
																							gap: 'xs',
																							children: ($$renderer) => {
																								if (Typography.Text) {
																									$$renderer.push('<!--[-->');

																									Typography.Text($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->${$.escape(row.cells?.[col.id] ?? '')}`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);
																								Badge($$renderer, { variant: 'secondary', size: 'xs', content: row.badge });
																								$$renderer.push(`<!---->`);
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

																					if (Typography.Text) {
																						$$renderer.push('<!--[-->');

																						Typography.Text($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(row.cells?.[col.id] ?? '')}`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				$$renderer.push(`<!--]--></div>`);
																			} else {
																				$$renderer.push('<!--[-1-->');

																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(row.cells?.[col.id] ?? '')}`);
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

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														},

														$$slots: {
															default: true,
															summary: ($$renderer, { root }) => {
																{
																	if (row.children) {
																		$$renderer.push(`<!--[0--><!--[-->`);

																		const each_array_2 = $.ensure_array_like(row.children);

																		for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																			let child = each_array_2[$$index_1];

																			if (AccordionTable.Summary.Row) {
																				$$renderer.push('<!--[-->');

																				AccordionTable.Summary.Row($$renderer, {
																					root,
																					children: ($$renderer) => {
																						if (AccordionTable.Summary.Cell) {
																							$$renderer.push('<!--[-->');

																							AccordionTable.Summary.Cell($$renderer, {
																								root,
																								column: 'item',
																								alignment: 'middle-start',
																								children: ($$renderer) => {
																									if (child.cells?.item?.includes('<a href=')) {
																										$$renderer.push(`<!--[0-->${$.html(child.cells?.item ?? '')}`);
																									} else {
																										$$renderer.push('<!--[-1-->');

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-400',
																												color: '--fgcolor-neutral-secondary',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(child.cells?.item ?? '')}`);
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

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (AccordionTable.Summary.Cell) {
																							$$renderer.push('<!--[-->');

																							AccordionTable.Summary.Cell($$renderer, {
																								root,
																								column: 'usage',
																								alignment: 'middle-start',
																								children: ($$renderer) => {
																									$$renderer.push(`<div${$.attr_class('usage-cell-content svelte-v1pleg', void 0, {
																										'is-mobile': $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport),
																										'is-tablet': $.store_get($$store_subs ??= {}, '$isTabletViewport', isTabletViewport) && !$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)
																									})}><div class="usage-progress-section svelte-v1pleg">`);

																									if (child.progressData && child.progressData.length > 0 && child.maxValue) {
																										$$renderer.push('<!--[0-->');
																										ProgressBar($$renderer, { maxSize: child.maxValue, data: child.progressData });
																									} else {
																										$$renderer.push('<!--[-1-->');
																									}

																									$$renderer.push(`<!--]--></div> <div class="usage-text-section svelte-v1pleg">`);

																									if (child.cells?.usage?.includes(' / ')) {
																										$$renderer.push('<!--[0-->');

																										const usageParts = (child.cells?.usage ?? '').split(' / ');

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-400',
																												color: '--fgcolor-neutral-secondary',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(usageParts[0])}`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-400',
																												color: '--fgcolor-neutral-tertiary',
																												children: ($$renderer) => {
																													$$renderer.push(`<!----> / `);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-400',
																												color: '--fgcolor-neutral-tertiary',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(usageParts[1])}`);
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

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-400',
																												color: '--fgcolor-neutral-secondary',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(child.cells?.usage ?? '')}`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									}

																									$$renderer.push(`<!--]--></div></div>`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (AccordionTable.Summary.Cell) {
																							$$renderer.push('<!--[-->');

																							AccordionTable.Summary.Cell($$renderer, {
																								root,
																								column: 'price',
																								alignment: 'middle-end',
																								children: ($$renderer) => {
																									if (Typography.Text) {
																										$$renderer.push('<!--[-->');

																										Typography.Text($$renderer, {
																											variant: 'm-400',
																											color: '--fgcolor-neutral-secondary',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(child.cells?.price ?? '')}`);
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

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(`<!--]-->`);
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]-->`);
																}
															}
														}
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(`<!--]--> `);

											if (totalProjects() > projectsLimit() && hasProjectBreakdown()) {
												$$renderer.push('<!--[0-->');

												if (AccordionTable.Row) {
													$$renderer.push('<!--[-->');

													AccordionTable.Row($$renderer, {
														root,
														id: 'pagination-row',
														expandable: false,
														children: ($$renderer) => {
															if (AccordionTable.Cell) {
																$$renderer.push('<!--[-->');

																AccordionTable.Cell($$renderer, {
																	root,
																	column: 'item',
																	children: ($$renderer) => {
																		$$renderer.push(`<div class="pagination-left svelte-v1pleg">`);

																		PaginationComponent($$renderer, {
																			limit: projectsLimit(),
																			offset: projectsOffset(),
																			sum: totalProjects()
																		});

																		$$renderer.push(`<!----></div>`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (AccordionTable.Cell) {
																$$renderer.push('<!--[-->');
																AccordionTable.Cell($$renderer, { root, column: 'usage' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (AccordionTable.Cell) {
																$$renderer.push('<!--[-->');
																AccordionTable.Cell($$renderer, { root, column: 'price' });
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

											$$renderer.push(`<!--]--> `);

											if (availableCredit > 0) {
												$$renderer.push('<!--[0-->');

												if (AccordionTable.Row) {
													$$renderer.push('<!--[-->');

													AccordionTable.Row($$renderer, {
														root,
														id: 'credits-row',
														expandable: false,
														children: ($$renderer) => {
															if (AccordionTable.Cell) {
																$$renderer.push('<!--[-->');

																AccordionTable.Cell($$renderer, {
																	root,
																	column: 'item',
																	children: ($$renderer) => {
																		if (Layout.Stack) {
																			$$renderer.push('<!--[-->');

																			Layout.Stack($$renderer, {
																				inline: true,
																				direction: 'row',
																				gap: 'xxs',
																				alignItems: 'center',
																				alignContent: 'center',
																				children: ($$renderer) => {
																					Icon($$renderer, { icon: IconTag, color: '--fgcolor-success', size: 's' });
																					$$renderer.push(`<!----> `);

																					if (Typography.Text) {
																						$$renderer.push('<!--[-->');

																						Typography.Text($$renderer, {
																							color: '--fgcolor-neutral-primary',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Credits`);
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

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (AccordionTable.Cell) {
																$$renderer.push('<!--[-->');

																AccordionTable.Cell($$renderer, {
																	root,
																	column: 'usage',
																	children: ($$renderer) => {
																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');
																			Typography.Text($$renderer, { variant: 'm-500', color: '--fgcolor-neutral-primary' });
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

															$$renderer.push(` `);

															if (AccordionTable.Cell) {
																$$renderer.push('<!--[-->');

																AccordionTable.Cell($$renderer, {
																	root,
																	column: 'price',
																	children: ($$renderer) => {
																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				variant: 'm-500',
																				color: '--fgcolor-neutral-primary',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->-${$.escape(formatCurrency(creditsApplied()))}`);
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

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (AccordionTable.Row) {
												$$renderer.push('<!--[-->');

												AccordionTable.Row($$renderer, {
													root,
													id: 'total-row',
													expandable: false,
													children: ($$renderer) => {
														if (AccordionTable.Cell) {
															$$renderer.push('<!--[-->');

															AccordionTable.Cell($$renderer, {
																root,
																column: 'item',
																children: ($$renderer) => {
																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			variant: 'm-500',
																			color: '--fgcolor-neutral-primary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Total`);
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

														$$renderer.push(` `);

														if (AccordionTable.Cell) {
															$$renderer.push('<!--[-->');

															AccordionTable.Cell($$renderer, {
																root,
																column: 'usage',
																children: ($$renderer) => {
																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');
																		Typography.Text($$renderer, { variant: 'm-500', color: '--fgcolor-neutral-primary' });
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

														$$renderer.push(` `);

														if (AccordionTable.Cell) {
															$$renderer.push('<!--[-->');

															AccordionTable.Cell($$renderer, {
																root,
																column: 'price',
																children: ($$renderer) => {
																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			variant: 'm-500',
																			color: '--fgcolor-neutral-primary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(formatCurrency(totalAmount()))}`);
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

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}
									}
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</div> <div class="actions-container">`);

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									alignItems: 'center',
									justifyContent: 'flex-end',
									gap: 's',
									wrap: 'wrap',
									class: 'u-width-full-line actions-mobile',
									children: ($$renderer) => {
										Tooltip($$renderer, {
											disabled: !isUpgrading(),
											children: ($$renderer) => {
												$$renderer.push(`<div>`);

												if (!currentPlan.requiresPaymentMethod) {
													$$renderer.push('<!--[0-->');

													Button($$renderer, {
														text: true,
														disabled: $.store_get($$store_subs ??= {}, '$organization', organization)?.markedForDeletion || isUpgrading(),
														href: getChangePlanUrl($.store_get($$store_subs ??= {}, '$organization', organization)?.$id),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Upgrade`);
														},
														$$slots: { default: true }
													});
												} else if ($.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanDowngrade !== null) {
													$$renderer.push('<!--[1-->');

													Button($$renderer, {
														text: true,
														disabled: isUpgrading(),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel change`);
														},
														$$slots: { default: true }
													});
												} else {
													$$renderer.push('<!--[-1-->');

													Button($$renderer, {
														text: true,
														disabled: $.store_get($$store_subs ??= {}, '$organization', organization)?.markedForDeletion || isUpgrading(),
														href: getChangePlanUrl($.store_get($$store_subs ??= {}, '$organization', organization)?.$id),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Change plan`);
														},
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!--]--></div>`);
											},

											$$slots: {
												default: true,
												tooltip: ($$renderer) => {
													{
														$$renderer.push(`Your payment is still being processed, check with your payment provider.`);
													}
												}
											}
										});

										$$renderer.push(`<!----> `);

										if (!currentPlan?.usagePerProject) {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												text: !currentPlan.requiresPaymentMethod,
												secondary: currentPlan.requiresPaymentMethod,
												href: `${base}/organization-${$.store_get($$store_subs ??= {}, '$organization', organization)?.$id}/usage`,
												children: ($$renderer) => {
													$$renderer.push(`<!---->View estimated usage`);
												},
												$$slots: { default: true }
											});
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

							$$renderer.push(`</div>`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			CancelDowngradeModel($$renderer, {
				get showCancel() {
					return showCancel;
				},

				set showCancel($$value) {
					showCancel = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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