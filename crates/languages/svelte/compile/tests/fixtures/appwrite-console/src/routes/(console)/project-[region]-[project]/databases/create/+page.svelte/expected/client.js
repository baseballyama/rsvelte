import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="svelte-v7qmwy"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<img class="backups-promo svelte-v7qmwy" alt="Backups promo"/> <!>`, 1);
var root_3 = $.from_html(`<div class="card-selector svelte-v7qmwy"><!></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const $user = () => $.store_get(user, '$user', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $createDatabaseStore = () => $.store_get(createDatabaseStore, '$createDatabaseStore', $$stores);
	const $isSubmitting = () => $.store_get($.get(isSubmitting), '$isSubmitting', $$stores);
	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const $isTabletViewport = () => $.store_get(isTabletViewport, '$isTabletViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];

	const // goto the database id
	cloudBackupOptions = ($$anchor, $$arg0) => {
		let disabled = $.derived_safe_equal(() => $.fallback($$arg0?.(), false));
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();

				$.set_style(div, '', {}, { width: '100%' });

				var node_1 = $.child(div);

				CreatePolicy(node_1, {
					get disabled() {
						return $.get(disabled);
					},
					title: 'Backup policies',
					get project() {
						return $$props.data.project;
					},
					subtitle: 'Protect your data and ensure quick recovery by adding backup policies.',
					get totalPolicies() {
						return $.get(totalPolicies);
					},

					set totalPolicies($$value) {
						$.set(totalPolicies, $$value, true);
					},

					get isShowing() {
						return $.get(showCreatePolicies);
					},

					set isShowing($$value) {
						$.set(showCreatePolicies, $$value, true);
					}
				});

				$.reset(div);
				$.append($$anchor, div);
			};

			var alternate = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => Alert.Inline, ($$anchor, Alert_Inline) => {
					Alert_Inline($$anchor, {
						title: 'This database won\'t be backed up',
						status: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Upgrade your plan to ensure your data stays safe and backed up.');

							$.append($$anchor, text);
						},

						$$slots: {
							default: true,
							actions: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => getChangePlanUrl($$props.data?.project?.teamId));

									Button($$anchor, {
										compact: true,
										get href() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Upgrade plan');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if ($currentPlan()?.backupsEnabled) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	const selfHostedBackupOptions = ($$anchor) => {
		var fragment_3 = $.comment();
		var node_3 = $.first_child(fragment_3);

		$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack) => {
			Layout_Stack($$anchor, {
				gap: 'xl',
				style: 'position: relative;',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_4 = $.first_child(fragment_4);

					{
						let $0 = $.derived(() => !$isTabletViewport() ? 'row' : 'column');

						$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								get direction() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var img = $.first_child(fragment_5);

									$.set_style(img, '', {}, { width: '100vw' });

									var node_5 = $.sibling(img, 2);

									$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											gap: 'l',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_6 = $.first_child(fragment_6);

												$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
													Layout_Stack_3($$anchor, {
														gap: 'xs',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var node_7 = $.first_child(fragment_7);

															$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text) => {
																Typography_Text($$anchor, {
																	variant: 'm-600',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Backups are available on Appwrite Cloud');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																Typography_Text_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Sign up to access backups. Schedule automatic or manual backups to protect\n                        your data and ensure quick recovery.');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_6, 2);

												$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
													Layout_Stack_4($$anchor, {
														inline: true,
														alignItems: 'flex-start',
														children: ($$anchor, $$slotProps) => {
															Button($$anchor, {
																external: true,
																secondary: true,
																fullWidthMobile: true,
																href: 'https://cloud.appwrite.io/register',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text('Sign up to Cloud');

																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.template_effect(() => $.set_attribute(img, 'src', $.get(backupsImg)));
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_3);
	};

	const selectDatabaseType = ($$anchor, $$arg0) => {
		let disabled = $.derived_safe_equal(() => $.fallback($$arg0?.(), false));
		var fragment_9 = $.comment();
		var node_10 = $.first_child(fragment_9);

		$.component(node_10, () => Layout.Grid, ($$anchor, Layout_Grid) => {
			Layout_Grid($$anchor, {
				columns: 3,
				columnsS: 1,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = $.comment();
					var node_11 = $.first_child(fragment_10);

					$.each(node_11, 17, () => $.get(databaseTypes), $.index, ($$anchor, databaseType) => {
						var div_1 = root_3();
						var node_12 = $.child(div_1);

						$.component(node_12, () => Card.Selector, ($$anchor, Card_Selector) => {
							Card_Selector($$anchor, {
								get disabled() {
									return $.get(disabled);
								},
								variant: 'secondary',
								get name() {
									return $.get(databaseType).type;
								},

								get id() {
									return $.get(databaseType).type;
								},

								get value() {
									return $.get(databaseType).type;
								},

								get title() {
									return $.get(databaseType).title;
								},
								imageRadius: 's',
								get group() {
									return $.get(type);
								},

								set group($$value) {
									$.set(type, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text();

									$.template_effect(() => $.set_text(text_5, $.get(databaseType).subtitle));
									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_9);
	};

	let formComponent;
	let showCreatePolicies = $.state(false);
	let totalPolicies = $.state($.proxy([]));
	let showExitModal = $.state(false);
	let isSubmitting = $.state($.proxy(writable(false)));
	let previousPage = $.state($.proxy(resolveRoute('/')));
	const typeFromParams = page.url.searchParams.get('type') ?? null;
	let type = $.state($.proxy(typeFromParams ?? 'tablesdb'));
	const isDark = $.derived(() => $app().themeInUse === 'dark');
	const backupsImg = $.derived(() => $.get(isDark) ? EmptyDarkMobile : EmptyLightMobile);
	const isMultiDb = $.derived(() => flags.multiDb({ account: $user(), organization: $organization() }));

	const databaseTypes = $.derived(() => [
		{
			type: 'tablesdb',
			title: 'TablesDB',
			subtitle: 'Structure your data in rows and columns. Best for relational data and advanced querying.'
		},

		...$.get(isMultiDb)
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

	afterNavigate(({ from }) => $.set(previousPage, from?.url?.pathname || $.get(previousPage), true));

	function trackPolicyEvents() {
		$.get(totalPolicies).forEach((policy) => {
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

		$.set(totalPolicies, [], true);
	}

	async function createPolicies(resourceId) {
		if (!$.get(totalPolicies).length) return;

		const totalPoliciesPromise = $.get(totalPolicies).map((policy) => {
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
			const databaseId = $createDatabaseStore().id ?? ID.unique();
			let database;
			const databaseSdk = useDatabaseSdk(page.params.region, page.params.project);

			database = await databaseSdk.create($.get(type), { databaseId, name: $createDatabaseStore().name });
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
		$.store_mutate(createDatabaseStore, $.untrack($createDatabaseStore).id = '', $.untrack($createDatabaseStore));
		$.store_mutate(createDatabaseStore, $.untrack($createDatabaseStore).name = '', $.untrack($createDatabaseStore));
	}

	Wizard($$anchor, {
		title: 'Create database',
		get href() {
			return $.get(previousPage);
		},
		confirmExit: true,
		column: true,
		columnSize: 's',
		onExit: resetCreateDatabaseStore,
		get showExitModal() {
			return $.get(showExitModal);
		},

		set showExitModal($$value) {
			$.set(showExitModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Form($$anchor, {
					onSubmit: createDatabase,
					get isSubmitting() {
						return $.get(isSubmitting);
					},

					set isSubmitting($$value) {
						$.store_unsub($.set(isSubmitting, $$value, true), '$isSubmitting', $$stores);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_14 = $.comment();
						var node_13 = $.first_child(fragment_14);

						$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
							Layout_Stack_5($$anchor, {
								gap: 'xxl',
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root_4();
									var node_14 = $.first_child(fragment_15);

									{
										var consequent_1 = ($$anchor) => {
											Fieldset($$anchor, {
												legend: 'Database type',
												children: ($$anchor, $$slotProps) => {
													selectDatabaseType($$anchor, $isSubmitting);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_14, ($$render) => {
											if (typeFromParams === null) $$render(consequent_1);
										});
									}

									var node_15 = $.sibling(node_14, 2);

									Fieldset(node_15, {
										legend: 'Details',
										children: ($$anchor, $$slotProps) => {
											var fragment_18 = $.comment();
											var node_16 = $.first_child(fragment_18);

											$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
												Layout_Stack_6($$anchor, {
													direction: 'column',
													gap: 'l',
													children: ($$anchor, $$slotProps) => {
														var fragment_19 = root_1();
														var node_17 = $.first_child(fragment_19);

														InputText(node_17, {
															required: true,
															id: 'name',
															autofocus: true,
															label: 'Name',
															get disabled() {
																return $isSubmitting();
															},
															placeholder: 'Enter database name',
															get value() {
																return $createDatabaseStore().name;
															},

															set value($$value) {
																$.store_mutate(createDatabaseStore, $.untrack($createDatabaseStore).name = $$value, $.untrack($createDatabaseStore));
															}
														});

														var node_18 = $.sibling(node_17, 2);

														CustomId(node_18, {
															show: true,
															name: 'Database',
															required: false,
															autofocus: false,
															get disabled() {
																return $isSubmitting();
															},

															get syncFrom() {
																return $createDatabaseStore().name;
															},

															get id() {
																return $createDatabaseStore().id;
															},

															set id($$value) {
																$.store_mutate(createDatabaseStore, $.untrack($createDatabaseStore).id = $$value, $.untrack($createDatabaseStore));
															}
														});

														$.append($$anchor, fragment_19);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_18);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_15, 2);

									Fieldset(node_19, {
										legend: 'Backups',
										children: ($$anchor, $$slotProps) => {
											var fragment_20 = $.comment();
											var node_20 = $.first_child(fragment_20);

											{
												var consequent_2 = ($$anchor) => {
													cloudBackupOptions($$anchor, $isSubmitting);
												};

												var alternate_1 = ($$anchor) => {
													selfHostedBackupOptions($$anchor);
												};

												$.if(node_20, ($$render) => {
													if (isCloud) $$render(consequent_2); else $$render(alternate_1, -1);
												});
											}

											$.append($$anchor, fragment_20);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_15);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_14);
					},
					$$slots: { default: true }
				}),
				($$value) => formComponent = $$value,
				() => formComponent
			);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_23 = root_1();
				var node_21 = $.first_child(fragment_23);

				Button(node_21, {
					secondary: true,
					get disabled() {
						return $isSubmitting();
					},
					$$events: { click: () => $.set(showExitModal, true) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Cancel');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_22 = $.sibling(node_21, 2);

				Button(node_22, {
					submissionLoader: true,
					get disabled() {
						return $isSubmitting();
					},

					get forceShowLoader() {
						return $isSubmitting();
					},
					$$events: { click: () => formComponent.triggerSubmit() },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Create');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_23);
			}
		}
	});

	$.pop();
	$$cleanup();
}