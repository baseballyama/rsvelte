import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let policyCreateError = null;
		let totalPolicies = [];
		const isDisabled = $.derived(() => isSelfHosted || isCloud && !$.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).backupsEnabled);

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
					resourceId: data.database.$id
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
			const totalPoliciesPromise = totalPolicies.map((policy) => {
				cronExpression(policy);

				return sdk.forProject(page.params.region, page.params.project).backups.createPolicy({
					policyId: ID.unique(),
					services: [BackupServices.Databases],
					retention: policy.retained,
					schedule: policy.schedule,
					name: policy.label,
					resourceId: data.database.$id
				});
			});

			try {
				await Promise.all(totalPoliciesPromise);

				const message = totalPolicies.length > 1
					? `Backup policies have been created`
					: `<b>${totalPolicies[0].label}</b> policy has been created`;

				addNotification({ isHtml: true, type: 'success', message });
				trackEvents(totalPolicies);
				await invalidate(Dependencies.BACKUPS);
				showFeedbackNotification();
				totalPolicies = [];
				$.store_set(showCreatePolicy, false);
			} catch(err) {
				policyCreateError = err.message;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				size: 'xxl',
				databasesMainScreen: true,
				children: ($$renderer) => {
					$$renderer.push(`<div class="backups-page u-flex u-gap-32 u-flex-vertical-mobile">`);

					if (!isDisabled()) {
						$$renderer.push(`<!--[0--><div class="u-flex-vertical u-gap-16 policies-holder-card svelte-13go8dp">`);

						ContainerHeader($$renderer, {
							title: 'Policies',
							buttonText: 'Create policy',
							buttonEvent: 'create_backup',
							buttonType: 'secondary',
							project: data.project,
							buttonDisabled: isDisabled(),
							policiesCreated: data.policies.total,
							maxPolicies: $.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).backupPolicies,
							buttonMethod: () => {
								$.store_set(showCreatePolicy, true);
								trackEvent('click_policy_create');
							}
						});

						$$renderer.push(`<!----> `);

						BackupPolicy($$renderer, {
							policies: data.policies,
							lastBackupDates: data.lastBackupDates,
							get showCreatePolicy() {
								return $.store_get($$store_subs ??= {}, '$showCreatePolicy', showCreatePolicy);
							},

							set showCreatePolicy($$value) {
								$.store_set(showCreatePolicy, $$value);
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div> <div class="u-flex-vertical u-gap-16 u-width-full-line u-overflow-x-auto">`);

						ContainerHeader($$renderer, {
							title: 'Backups',
							buttonText: 'Manual backup',
							buttonEvent: 'create_backup',
							buttonType: 'secondary',
							project: data.project,
							buttonDisabled: isDisabled(),
							buttonMethod: () => {
								$.store_set(showCreateBackup, true);
								trackEvent('click_manual_create');
							}
						});

						$$renderer.push(`<!----> `);

						if (data.backups.total) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xxl',
									children: ($$renderer) => {
										Table($$renderer, { data });
										$$renderer.push(`<!----> `);

										if (data.backups.total > 6) {
											$$renderer.push('<!--[0-->');

											PaginationWithLimit($$renderer, {
												name: 'Backups',
												limit: data.limit,
												offset: data.offset,
												total: data.backups.total
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
						} else {
							$$renderer.push(`<!--[-1--><div class="u-flex u-flex-vertical u-gap-16"><article class="empty card u-width-full-line common-section svelte-13go8dp">No backups yet</article></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="u-flex-vertical u-gap-32">`);
						LockedCard($$renderer, { project: data.project });
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				title: 'Create backup policy',
				onSubmit: createPolicies,
				get show() {
					return $.store_get($$store_subs ??= {}, '$showCreatePolicy', showCreatePolicy);
				},

				set show($$value) {
					$.store_set(showCreatePolicy, $$value);
					$$settled = false;
				},

				get error() {
					return policyCreateError;
				},

				set error($$value) {
					policyCreateError = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					CreatePolicy($$renderer, {
						isShowing: $.store_get($$store_subs ??= {}, '$showCreatePolicy', showCreatePolicy),
						isFromBackupsTab: true,
						project: data.project,
						get totalPolicies() {
							return totalPolicies;
						},

						set totalPolicies($$value) {
							totalPolicies = $$value;
							$$settled = false;
						}
					});
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								disabled: !totalPolicies.length,
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

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				size: 's',
				title: 'Create manual backup',
				onSubmit: createManualBackup,
				get show() {
					return $.store_get($$store_subs ??= {}, '$showCreateBackup', showCreateBackup);
				},

				set show($$value) {
					$.store_set(showCreateBackup, $$value);
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Typography.Text) {
						$$renderer.push('<!--[-->');

						Typography.Text($$renderer, {
							variant: 'm-400',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Manual backups are <b>retained forever</b> unless manually deleted. Use for major data changes
        or rollback safeguards.`);
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
							variant: 'm-500',
							children: ($$renderer) => {
								$$renderer.push(`<b>Depending on the size of your data, this may take a while.</b>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								text: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
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