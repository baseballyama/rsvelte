import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputCron } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { func } from '../store';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { Runtime } from '@appwrite.io/console';
import { Link } from '$lib/elements';
import { parseExpression } from 'cron-parser';

export default function UpdateSchedule($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const functionId = page.params.function;
		let functionSchedule = null;

		onMount(async () => {
			functionSchedule ??= $.store_get($$store_subs ??= {}, '$func', func).schedule;
		});

		async function updateSchedule() {
			try {
				if (!isValueOfStringEnum(Runtime, $.store_get($$store_subs ??= {}, '$func', func).runtime)) {
					throw new Error(`Invalid runtime: ${$.store_get($$store_subs ??= {}, '$func', func).runtime}`);
				}

				// an error is shown if invalid.
				parseExpression(functionSchedule);

				await sdk.forProject(page.params.region, page.params.project).functions.update({
					functionId,
					name: $.store_get($$store_subs ??= {}, '$func', func).name,
					runtime: $.store_get($$store_subs ??= {}, '$func', func).runtime,
					execute: $.store_get($$store_subs ??= {}, '$func', func).execute || undefined,
					events: $.store_get($$store_subs ??= {}, '$func', func).events || undefined,
					schedule: functionSchedule,
					timeout: $.store_get($$store_subs ??= {}, '$func', func).timeout || undefined,
					enabled: $.store_get($$store_subs ??= {}, '$func', func).enabled ?? undefined,
					logging: $.store_get($$store_subs ??= {}, '$func', func).logging ?? undefined,
					entrypoint: $.store_get($$store_subs ??= {}, '$func', func).entrypoint || undefined,
					commands: $.store_get($$store_subs ??= {}, '$func', func).commands || undefined,
					scopes: $.store_get($$store_subs ??= {}, '$func', func).scopes || undefined,
					installationId: $.store_get($$store_subs ??= {}, '$func', func).installationId || undefined,
					providerRepositoryId: $.store_get($$store_subs ??= {}, '$func', func).providerRepositoryId || undefined,
					providerBranch: $.store_get($$store_subs ??= {}, '$func', func).providerBranch || undefined,
					providerSilentMode: $.store_get($$store_subs ??= {}, '$func', func).providerSilentMode ?? undefined,
					providerRootDirectory: $.store_get($$store_subs ??= {}, '$func', func).providerRootDirectory || undefined,
					buildSpecification: $.store_get($$store_subs ??= {}, '$func', func).buildSpecification || undefined,
					deploymentRetention: $.store_get($$store_subs ??= {}, '$func', func).deploymentRetention ?? undefined
				});

				await invalidate(Dependencies.FUNCTION);
				addNotification({ type: 'success', message: 'Cron Schedule has been updated' });
				trackEvent(Submit.FunctionUpdateSchedule);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.FunctionUpdateSchedule);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateSchedule,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Set a Cron schedule to trigger your function. Leave blank for no schedule. `);

							Link($$renderer, {
								href: 'https://appwrite.io/docs/products/functions/execution#schedule',
								external: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Learn more`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Schedule`);
								}
							},

							aside: ($$renderer) => {
								{
									InputCron($$renderer, {
										label: 'Schedule (Cron syntax)',
										id: 'schedule',
										get value() {
											return functionSchedule;
										},

										set value($$value) {
											functionSchedule = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: $.store_get($$store_subs ??= {}, '$func', func).schedule === functionSchedule,
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}