import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal, PaginationWithLimit } from '$lib/components';
import { Container } from '$lib/layout';
import ContainerHeader from './containerHeader.svelte';
import BackupPolicy from './policy.svelte';
import LockedCard from './locked.svelte';
import Table from './table.svelte';
import CreatePolicy from './createPolicy.svelte';
import { Button } from '$lib/elements/forms';
import { addNotification, dismissAllNotifications } from '$lib/stores/notifications';
import { realtime, sdk } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { isCloud, isSelfHosted } from '$lib/system';
import { currentPlan } from '$lib/stores/organization';
import { onMount } from 'svelte';
import { feedback } from '$lib/stores/feedback';
import { cronExpression } from '$lib/helpers/backups';
import { BackupServices, ID } from '@appwrite.io/console';
import { showCreateBackup, showCreatePolicy } from './store';
import { getProjectId } from '$lib/helpers/project';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Layout, Typography } from '@appwrite.io/pink-svelte';
import { page } from '$app/state';
import IconQuestionMarkCircle from './components/questionIcon.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="u-flex u-flex-vertical u-gap-16"><article class="empty card u-width-full-line common-section svelte-13go8dp">No backups yet</article></div>`);
var root_2 = $.from_html(`<div class="u-flex-vertical u-gap-16 policies-holder-card svelte-13go8dp"><!> <!></div> <div class="u-flex-vertical u-gap-16 u-width-full-line u-overflow-x-auto"><!> <!></div>`, 1);
var root_3 = $.from_html(`<div class="u-flex-vertical u-gap-32"><!></div>`);
var root_4 = $.from_html(`<div class="backups-page u-flex u-gap-32 u-flex-vertical-mobile"><!></div>`);

var root_5 = $.from_html(
	`Manual backups are <b>retained forever</b> unless manually deleted. Use for major data changes
        or rollback safeguards.`,
	1
);

var root_6 = $.from_html(`<b>Depending on the size of your data, this may take a while.</b>`);
var root_7 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const $showCreateBackup = () => $.store_get(showCreateBackup, '$showCreateBackup', $$stores);
	const $showCreatePolicy = () => $.store_get(showCreatePolicy, '$showCreatePolicy', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let policyCreateError = $.state(null);
	let totalPolicies = $.state($.proxy([]));
	const isDisabled = $.derived(() => isSelfHosted || isCloud && !$currentPlan().backupsEnabled);

	const showFeedbackNotification = () => {
		let counter = localStorage.getItem('createBackupsCounter');
		const parsedCounter = counter ? parseInt(counter, 10) : 0;

		// Exponential growth: Show after 1, 2, 4, 8, 16 uses
		const showOnCount = Math.pow(2, Math.floor(Math.log2(parsedCounter)) || 0);

		if (parsedCounter === showOnCount || !counter) {
			addNotification({
				type: 'info',
				icon: IconQuestionMarkCircle,
				message: 'How was your experience with our new Backups feature? Give us your feedback and help us improve!',
				timeout: 15000,
				buttons: [
					{
						name: 'Leave feedback',
						method: () => {
							dismissAllNotifications();
							feedback.toggleFeedback('backups');
						}
					},

					{
						name: 'Ask me later',
						method: () => dismissAllNotifications()
					}
				]
			});
		}

		localStorage.setItem('createBackupsCounter', ((parsedCounter ?? 0) + 1).toString());
	};

	const createManualBackup = async () => {
		try {
			await sdk.forProject(page.params.region, page.params.project).backups.createArchive({
				services: [BackupServices.Databases],
				resourceId: $$props.data.database.$id
			});

			await invalidate(Dependencies.BACKUPS);
			addNotification({ type: 'success', message: 'Database backup has started' });
			trackEvent('click_manual_submit');
			showFeedbackNotification();
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
		} finally {
			$.store_set(showCreateBackup, false);
		}
	};

	const trackEvents = (policies) => {
		policies.forEach((policy) => {
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

			if (actualDay) message['monthlyInterval'] = actualDay;

			trackEvent(Submit.DatabaseBackupPolicyCreate, message);
		});
	};

	const createPolicies = async () => {
		const totalPoliciesPromise = $.get(totalPolicies).map((policy) => {
			cronExpression(policy);

			return sdk.forProject(page.params.region, page.params.project).backups.createPolicy({
				policyId: ID.unique(),
				services: [BackupServices.Databases],
				retention: policy.retained,
				schedule: policy.schedule,
				name: policy.label,
				resourceId: $$props.data.database.$id
			});
		});

		try {
			await Promise.all(totalPoliciesPromise);

			const message = $.get(totalPolicies).length > 1
				? `Backup policies have been created`
				: `<b>${$.get(totalPolicies)[0].label}</b> policy has been created`;

			addNotification({ isHtml: true, type: 'success', message });
			trackEvents($.get(totalPolicies));
			await invalidate(Dependencies.BACKUPS);
			showFeedbackNotification();
			$.set(totalPolicies, [], true);
			$.store_set(showCreatePolicy, false);
		} catch(err) {
			$.set(policyCreateError, err.message, true);
			trackError(err, Submit.DatabaseBackupPolicyCreate);
		}
	};

	onMount(() => {
		return realtime.forProject(page.params.region, ['project', 'console'], (response) => {
			// fast path return.
			if (!response.channels.includes(`projects.${getProjectId()}`)) return;

			if (response.events.includes('archives.*') || response.events.includes('policies.*')) {
				invalidate(Dependencies.BACKUPS);
			}
		});
	});

	var fragment = root_7();
	var node = $.first_child(fragment);

	Container(node, {
		size: 'xxl',
		databasesMainScreen: true,
		children: ($$anchor, $$slotProps) => {
			var div = root_4();
			var node_1 = $.child(div);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_1 = root_2();
					var div_1 = $.first_child(fragment_1);
					var node_2 = $.child(div_1);

					ContainerHeader(node_2, {
						title: 'Policies',
						buttonText: 'Create policy',
						buttonEvent: 'create_backup',
						buttonType: 'secondary',
						get project() {
							return $$props.data.project;
						},

						get buttonDisabled() {
							return $.get(isDisabled);
						},

						get policiesCreated() {
							return $$props.data.policies.total;
						},

						get maxPolicies() {
							return $currentPlan().backupPolicies;
						},

						buttonMethod: () => {
							$.store_set(showCreatePolicy, true);
							trackEvent('click_policy_create');
						}
					});

					var node_3 = $.sibling(node_2, 2);

					BackupPolicy(node_3, {
						get policies() {
							return $$props.data.policies;
						},

						get lastBackupDates() {
							return $$props.data.lastBackupDates;
						},

						get showCreatePolicy() {
							$.mark_store_binding();

							return $showCreatePolicy();
						},

						set showCreatePolicy($$value) {
							$.store_set(showCreatePolicy, $$value);
						}
					});

					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_4 = $.child(div_2);

					ContainerHeader(node_4, {
						title: 'Backups',
						buttonText: 'Manual backup',
						buttonEvent: 'create_backup',
						buttonType: 'secondary',
						get project() {
							return $$props.data.project;
						},

						get buttonDisabled() {
							return $.get(isDisabled);
						},

						buttonMethod: () => {
							$.store_set(showCreateBackup, true);
							trackEvent('click_manual_create');
						}
					});

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_6 = $.first_child(fragment_2);

							$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									gap: 'xxl',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_7 = $.first_child(fragment_3);

										Table(node_7, {
											get data() {
												return $$props.data;
											}
										});

										var node_8 = $.sibling(node_7, 2);

										{
											var consequent = ($$anchor) => {
												PaginationWithLimit($$anchor, {
													name: 'Backups',
													get limit() {
														return $$props.data.limit;
													},

													get offset() {
														return $$props.data.offset;
													},

													get total() {
														return $$props.data.backups.total;
													}
												});
											};

											$.if(node_8, ($$render) => {
												if ($$props.data.backups.total > 6) $$render(consequent);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var div_3 = root_1();

							$.append($$anchor, div_3);
						};

						$.if(node_5, ($$render) => {
							if ($$props.data.backups.total) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.reset(div_2);
					$.append($$anchor, fragment_1);
				};

				var alternate_1 = ($$anchor) => {
					var div_4 = root_3();
					var node_9 = $.child(div_4);

					LockedCard(node_9, {
						get project() {
							return $$props.data.project;
						}
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_1, ($$render) => {
					if (!$.get(isDisabled)) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node, 2);

	Modal(node_10, {
		title: 'Create backup policy',
		onSubmit: createPolicies,
		get show() {
			$.mark_store_binding();

			return $showCreatePolicy();
		},

		set show($$value) {
			$.store_set(showCreatePolicy, $$value);
		},

		get error() {
			return $.get(policyCreateError);
		},

		set error($$value) {
			$.set(policyCreateError, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			CreatePolicy($$anchor, {
				get isShowing() {
					return $showCreatePolicy();
				},
				isFromBackupsTab: true,
				get project() {
					return $$props.data.project;
				},

				get totalPolicies() {
					return $.get(totalPolicies);
				},

				set totalPolicies($$value) {
					$.set(totalPolicies, $$value, true);
				}
			});
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_6 = root();
				var node_11 = $.first_child(fragment_6);

				Button(node_11, {
					secondary: true,
					$$events: { click: () => $.store_set(showCreatePolicy, false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				{
					let $0 = $.derived(() => !$.get(totalPolicies).length);

					Button(node_12, {
						submit: true,
						get disabled() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Create');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_6);
			}
		}
	});

	var node_13 = $.sibling(node_10, 2);

	Modal(node_13, {
		size: 's',
		title: 'Create manual backup',
		onSubmit: createManualBackup,
		get show() {
			$.mark_store_binding();

			return $showCreateBackup();
		},

		set show($$value) {
			$.store_set(showCreateBackup, $$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_14 = $.first_child(fragment_7);

			$.component(node_14, () => Typography.Text, ($$anchor, Typography_Text) => {
				Typography_Text($$anchor, {
					variant: 'm-400',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_8 = root_5();

						$.next(2);
						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			var node_15 = $.sibling(node_14, 2);

			$.component(node_15, () => Typography.Text, ($$anchor, Typography_Text_1) => {
				Typography_Text_1($$anchor, {
					variant: 'm-500',
					children: ($$anchor, $$slotProps) => {
						var b = root_6();

						$.append($$anchor, b);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_7);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_9 = root();
				var node_16 = $.first_child(fragment_9);

				Button(node_16, {
					text: true,
					$$events: { click: () => $.store_set(showCreateBackup, false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Cancel');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_17 = $.sibling(node_16, 2);

				Button(node_17, {
					submit: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Create');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_9);
			}
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}