import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputSelect, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Adapter, BuildRuntime, Framework } from '@appwrite.io/console';

export default function UpdateDeploymentRetention($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { site } = $$props;
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

		const getInitialDeploymentRetention = () => site.deploymentRetention;

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

		let unlimitedRetention = getInitialDeploymentRetention() === 0;
		let retentionDays = getInitialDeploymentRetention() > 0 ? getInitialDeploymentRetention() : 30;
		const retentionOptions = $.derived(() => getRetentionOptions(retentionDays));
		const deploymentRetention = $.derived(() => unlimitedRetention ? 0 : retentionDays);
		let isUnchanged = $.derived(() => site.deploymentRetention === deploymentRetention());
		let isInvalid = $.derived(() => !unlimitedRetention && (retentionDays === null || retentionDays < 1 || retentionDays > MAX_DEPLOYMENT_RETENTION));

		async function update() {
			try {
				await sdk.forProject(page.params.region, page.params.project).sites.update({
					siteId: site.$id,
					name: site.name,
					framework: site.framework,
					enabled: site.enabled ?? undefined,
					logging: site.logging ?? undefined,
					timeout: site.timeout || undefined,
					installCommand: site.installCommand || undefined,
					buildCommand: site.buildCommand || undefined,
					outputDirectory: site.outputDirectory || undefined,
					buildRuntime: site.buildRuntime || undefined,
					adapter: site.adapter,
					fallbackFile: site.fallbackFile || undefined,
					installationId: site.installationId || undefined,
					providerRepositoryId: site.providerRepositoryId || undefined,
					providerBranch: site.providerBranch || undefined,
					providerSilentMode: site.providerSilentMode ?? undefined,
					providerRootDirectory: site.providerRootDirectory || undefined,
					buildSpecification: site.buildSpecification || undefined,
					runtimeSpecification: site.runtimeSpecification || undefined,
					deploymentRetention: deploymentRetention()
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: update,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Keep active deployments and choose when inactive deployments are deleted.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Deployment retention`);
								}
							},

							aside: ($$renderer) => {
								{
									InputSwitch($$renderer, {
										id: 'deployment-retention-unlimited',
										label: 'Keep deployments forever',
										get value() {
											return unlimitedRetention;
										},

										set value($$value) {
											unlimitedRetention = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (!unlimitedRetention) {
										$$renderer.push('<!--[0-->');

										InputSelect($$renderer, {
											id: 'deployment-retention',
											label: 'Keep for',
											placeholder: '1 Month',
											options: retentionOptions(),
											required: true,
											get value() {
												return retentionDays;
											},

											set value($$value) {
												retentionDays = $$value;
												$$settled = false;
											}
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: isUnchanged() || isInvalid(),
										submit: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}