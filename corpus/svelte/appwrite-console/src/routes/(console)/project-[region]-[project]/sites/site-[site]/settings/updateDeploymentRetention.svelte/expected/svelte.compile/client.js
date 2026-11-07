import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputSelect, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Adapter, BuildRuntime, Framework } from '@appwrite.io/console';

var root = $.from_html(`<!> <!>`, 1);

export default function UpdateDeploymentRetention($$anchor, $$props) {
	$.push($$props, true);

	const MAX_DEPLOYMENT_RETENTION = 36500;

	const DEPLOYMENT_RETENTION_OPTIONS = [
		{ value: 7, label: '1 Week' },
		{ value: 30, label: '1 Month' },
		{ value: 90, label: '3 Months' },
		{ value: 180, label: '6 Months' },
		{ value: 365, label: '1 Year' },
		{ value: 730, label: '2 Years' },
		{ value: 1825, label: '5 Years' },
		{ value: 3650, label: '10 Years' }
	];

	const getInitialDeploymentRetention = () => $$props.site.deploymentRetention;

	const getRetentionOptions = (retention) => {
		const hasCurrentOption = DEPLOYMENT_RETENTION_OPTIONS.some((option) => option.value === retention);

		if (retention < 1 || retention > MAX_DEPLOYMENT_RETENTION || hasCurrentOption) {
			return DEPLOYMENT_RETENTION_OPTIONS;
		}

		return [
			{ value: retention, label: `${retention} days` },
			...DEPLOYMENT_RETENTION_OPTIONS
		];
	};

	let unlimitedRetention = $.state(getInitialDeploymentRetention() === 0);
	let retentionDays = $.state($.proxy(getInitialDeploymentRetention() > 0 ? getInitialDeploymentRetention() : 30));
	const retentionOptions = $.derived(() => getRetentionOptions($.get(retentionDays)));
	const deploymentRetention = $.derived(() => $.get(unlimitedRetention) ? 0 : $.get(retentionDays));
	let isUnchanged = $.derived(() => $$props.site.deploymentRetention === $.get(deploymentRetention));
	let isInvalid = $.derived(() => !$.get(unlimitedRetention) && ($.get(retentionDays) === null || $.get(retentionDays) < 1 || $.get(retentionDays) > MAX_DEPLOYMENT_RETENTION));

	async function update() {
		try {
			await sdk.forProject(page.params.region, page.params.project).sites.update({
				siteId: $$props.site.$id,
				name: $$props.site.name,
				framework: $$props.site.framework,
				enabled: $$props.site.enabled ?? undefined,
				logging: $$props.site.logging ?? undefined,
				timeout: $$props.site.timeout || undefined,
				installCommand: $$props.site.installCommand || undefined,
				buildCommand: $$props.site.buildCommand || undefined,
				outputDirectory: $$props.site.outputDirectory || undefined,
				buildRuntime: $$props.site.buildRuntime || undefined,
				adapter: $$props.site.adapter,
				fallbackFile: $$props.site.fallbackFile || undefined,
				installationId: $$props.site.installationId || undefined,
				providerRepositoryId: $$props.site.providerRepositoryId || undefined,
				providerBranch: $$props.site.providerBranch || undefined,
				providerSilentMode: $$props.site.providerSilentMode ?? undefined,
				providerRootDirectory: $$props.site.providerRootDirectory || undefined,
				buildSpecification: $$props.site.buildSpecification || undefined,
				runtimeSpecification: $$props.site.runtimeSpecification || undefined,
				deploymentRetention: $.get(deploymentRetention)
			});

			await invalidate(Dependencies.SITE);

			addNotification({
				type: 'success',
				message: 'Deployment retention has been updated'
			});

			trackEvent(Submit.SiteUpdateDeploymentRetention);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.SiteUpdateDeploymentRetention);
		}
	}

	Form($$anchor, {
		onSubmit: update,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Keep active deployments and choose when inactive deployments are deleted.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Deployment retention');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						InputSwitch(node, {
							id: 'deployment-retention-unlimited',
							label: 'Keep deployments forever',
							get value() {
								return $.get(unlimitedRetention);
							},

							set value($$value) {
								$.set(unlimitedRetention, $$value, true);
							}
						});

						var node_1 = $.sibling(node, 2);

						{
							var consequent = ($$anchor) => {
								InputSelect($$anchor, {
									id: 'deployment-retention',
									label: 'Keep for',
									placeholder: '1 Month',
									get options() {
										return $.get(retentionOptions);
									},
									required: true,
									get value() {
										return $.get(retentionDays);
									},

									set value($$value) {
										$.set(retentionDays, $$value, true);
									}
								});
							};

							$.if(node_1, ($$render) => {
								if (!$.get(unlimitedRetention)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $.get(isUnchanged) || $.get(isInvalid));

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Update');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}