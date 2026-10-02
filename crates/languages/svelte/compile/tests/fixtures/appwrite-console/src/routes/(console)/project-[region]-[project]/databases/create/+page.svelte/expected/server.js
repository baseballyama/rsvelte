import * as $ from 'svelte/internal/server';
import { Wizard } from '$lib/layout';
import { writable } from 'svelte/store';
import { Form, InputText, Button } from '$lib/elements/forms';
import { Alert, Card, Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';
import { resolveRoute } from '$lib/stores/navigation';
import { afterNavigate, goto } from '$app/navigation';
import { CustomId } from '$lib/components';
import { page } from '$app/state';
import { addNotification } from '$lib/stores/notifications';
import { BackupServices, ID } from '@appwrite.io/console';
import { useDatabaseSdk } from '$database/(entity)';
import { isCloud } from '$lib/system';
import { getChangePlanUrl } from '$lib/stores/billing';
import { currentPlan } from '$lib/stores/organization';
import EmptyDarkMobile from '$lib/images/backups/upgrade/backups-mobile-dark.png';
import EmptyLightMobile from '$lib/images/backups/upgrade/backups-mobile-light.png';
import { app } from '$lib/stores/app';
import { sdk } from '$lib/stores/sdk';
import { trackEvent } from '$lib/actions/analytics';
import CreatePolicy from '$database/backups/createPolicy.svelte';
import { cronExpression } from '$lib/helpers/backups';
import { createDatabaseStore } from './store';
import { isTabletViewport } from '$lib/stores/viewport';
import { flags } from '$lib/flags';
import { user } from '$lib/stores/user';
import { organization } from '$lib/stores/organization';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let formComponent;
		let showCreatePolicies = false;
		let totalPolicies = [];
		let showExitModal = false;
		let isSubmitting = writable(false);
		let previousPage = resolveRoute('/');
		const typeFromParams = page.url.searchParams.get('type') ?? null;
		let type = typeFromParams ?? 'tablesdb';
		const isDark = $.derived(() => $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark');
		const backupsImg = $.derived(() => isDark() ? EmptyDarkMobile : EmptyLightMobile);

		const isMultiDb = $.derived(() => flags.multiDb({
			account: $.store_get($$store_subs ??= {}, '$user', user),
			organization: $.store_get($$store_subs ??= {}, '$organization', organization)
		}));

		const databaseTypes = $.derived(() => [
			{
				type: 'tablesdb',
				title: 'TablesDB',
				subtitle: 'Structure your data in rows and columns. Best for relational data and advanced querying.'
			},

			...isMultiDb()
				? [
					{
						type: 'documentsdb',
						title: 'DocumentsDB',
						subtitle: 'Store flexible data without a fixed schema. Best for unstructured data and simple querying.'
					},

					{
						type: 'vectorsdb',
						title: 'VectorsDB',
						subtitle: 'Store data as vectors to find similar results. Best for semantic search and recommendations.'
					}
				]
				: []
		]);

		afterNavigate(({ from }) => previousPage = from?.url?.pathname || previousPage);

		function trackPolicyEvents() {
			totalPolicies.forEach((policy) => {
				let actualDay = null;
				const monthlyBackupFrequency = policy.monthlyBackupFrequency;

				switch (monthlyBackupFrequency) {
					case 'first':
						actualDay = '1st';
						break;

					case 'middle':
						actualDay = '15th';
						break;

					case 'end':

					default:
						actualDay = '28th';
						break;
				}

				const message = {
					keepFor: `${policy.retained} days`,
					frequency: policy.plainTextFrequency,
					policy: policy.default ? 'preset' : 'custom'
				};

				if (actualDay) {
					message['monthlyInterval'] = actualDay;
				}

				trackEvent('submit_policy_submit', message);
			});

			totalPolicies = [];
		}

		async function createPolicies(resourceId) {
			if (!totalPolicies.length) return;

			const totalPoliciesPromise = totalPolicies.map((policy) => {
				cronExpression(policy);

				return sdk.forProject(page.params.region, page.params.project).backups.createPolicy({
					policyId: ID.unique(),
					services: [BackupServices.Databases],
					retention: policy.retained,
					schedule: policy.schedule,
					name: policy.label,
					resourceId
				});
			});

			await Promise.all(totalPoliciesPromise);
			trackPolicyEvents();
		}

		async function createDatabase() {
			try {
				const databaseId = $.store_get($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore).id ?? ID.unique();
				let database;
				const databaseSdk = useDatabaseSdk(page.params.region, page.params.project);

				database = await databaseSdk.create(type, {
					databaseId,
					name: $.store_get($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore).name
				});

				await createPolicies(database.$id);

				addNotification({
					type: 'success',
					message: `${database.name} has been created`
				});

				// goto the database id
				await goto(resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', { ...page.params, database: database.$id }));

				resetCreateDatabaseStore();
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			}
		}

		function resetCreateDatabaseStore() {
			$.store_mutate($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore, $.store_get($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore).id = '');
			$.store_mutate($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore, $.store_get($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore).name = '');
		}

		function cloudBackupOptions($$renderer, disabled = false) {
			if ($.store_get($$store_subs ??= {}, '$currentPlan', currentPlan)?.backupsEnabled) {
				$$renderer.push(`<!--[0--><div class="svelte-v7qmwy"${$.attr_style('', { width: '100%' })}>`);

				CreatePolicy($$renderer, {
					disabled,
					title: 'Backup policies',
					project: data.project,
					subtitle: 'Protect your data and ensure quick recovery by adding backup policies.',
					get totalPolicies() {
						return totalPolicies;
					},

					set totalPolicies($$value) {
						totalPolicies = $$value;
						$$settled = false;
					},

					get isShowing() {
						return showCreatePolicies;
					},

					set isShowing($$value) {
						showCreatePolicies = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (Alert.Inline) {
					$$renderer.push('<!--[-->');

					Alert.Inline($$renderer, {
						title: 'This database won\'t be backed up',
						status: 'warning',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Upgrade your plan to ensure your data stays safe and backed up.`);
						},

						$$slots: {
							default: true,
							actions: ($$renderer) => {
								{
									Button($$renderer, {
										compact: true,
										href: getChangePlanUrl(data?.project?.teamId),
										children: ($$renderer) => {
											$$renderer.push(`<!---->Upgrade plan`);
										},
										$$slots: { default: true }
									});
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

			$$renderer.push(`<!--]-->`);
		}

		function selfHostedBackupOptions($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 'xl',
					style: 'position: relative;',
					children: ($$renderer) => {
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: !$.store_get($$store_subs ??= {}, '$isTabletViewport', isTabletViewport) ? 'row' : 'column',
								children: ($$renderer) => {
									$$renderer.push(`<img${$.attr('src', backupsImg())} class="backups-promo svelte-v7qmwy" alt="Backups promo"${$.attr_style('', { width: '100vw' })}/> `);

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'l',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'xs',
														children: ($$renderer) => {
															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	variant: 'm-600',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Backups are available on Appwrite Cloud`);
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
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Sign up to access backups. Schedule automatic or manual backups to protect
                        your data and ensure quick recovery.`);
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

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														inline: true,
														alignItems: 'flex-start',
														children: ($$renderer) => {
															Button($$renderer, {
																external: true,
																secondary: true,
																fullWidthMobile: true,
																href: 'https://cloud.appwrite.io/register',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Sign up to Cloud`);
																},
																$$slots: { default: true }
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

		function selectDatabaseType($$renderer, disabled = false) {
			if (Layout.Grid) {
				$$renderer.push('<!--[-->');

				Layout.Grid($$renderer, {
					columns: 3,
					columnsS: 1,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(databaseTypes());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let databaseType = each_array[$$index];

							$$renderer.push(`<div class="card-selector svelte-v7qmwy">`);

							if (Card.Selector) {
								$$renderer.push('<!--[-->');

								Card.Selector($$renderer, {
									disabled,
									variant: 'secondary',
									name: databaseType.type,
									id: databaseType.type,
									value: databaseType.type,
									title: databaseType.title,
									imageRadius: 's',
									get group() {
										return type;
									},

									set group($$value) {
										type = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(databaseType.subtitle)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</div>`);
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Create database',
				href: previousPage,
				confirmExit: true,
				column: true,
				columnSize: 's',
				onExit: resetCreateDatabaseStore,
				get showExitModal() {
					return showExitModal;
				},

				set showExitModal($$value) {
					showExitModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: createDatabase,
						get isSubmitting() {
							return isSubmitting;
						},

						set isSubmitting($$value) {
							isSubmitting = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xxl',
									children: ($$renderer) => {
										if (typeFromParams === null) {
											$$renderer.push('<!--[0-->');

											Fieldset($$renderer, {
												legend: 'Database type',
												children: ($$renderer) => {
													selectDatabaseType($$renderer, $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting));
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										Fieldset($$renderer, {
											legend: 'Details',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'column',
														gap: 'l',
														children: ($$renderer) => {
															InputText($$renderer, {
																required: true,
																id: 'name',
																autofocus: true,
																label: 'Name',
																disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
																placeholder: 'Enter database name',
																get value() {
																	return $.store_get($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore).name;
																},

																set value($$value) {
																	$.store_mutate($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore, $.store_get($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore).name = $$value);
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															CustomId($$renderer, {
																show: true,
																name: 'Database',
																required: false,
																autofocus: false,
																disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
																syncFrom: $.store_get($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore).name,
																get id() {
																	return $.store_get($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore).id;
																},

																set id($$value) {
																	$.store_mutate($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore, $.store_get($$store_subs ??= {}, '$createDatabaseStore', createDatabaseStore).id = $$value);
																	$$settled = false;
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
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Fieldset($$renderer, {
											legend: 'Backups',
											children: ($$renderer) => {
												if (isCloud) {
													$$renderer.push('<!--[0-->');
													cloudBackupOptions($$renderer, $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting));
												} else {
													$$renderer.push('<!--[-1-->');
													selfHostedBackupOptions($$renderer);
												}

												$$renderer.push(`<!--]-->`);
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
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submissionLoader: true,
								disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
								forceShowLoader: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
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
	});
}