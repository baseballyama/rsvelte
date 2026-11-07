import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { func } from '../store';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { Runtime } from '@appwrite.io/console';

export default function UpdateName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const functionId = page.params.function;
		let functionName = null;

		onMount(async () => {
			functionName ??= $.store_get($$store_subs ??= {}, '$func', func).name;
		});

		async function updateName() {
			try {
				if (!isValueOfStringEnum(Runtime, $.store_get($$store_subs ??= {}, '$func', func).runtime)) {
					throw new Error(`Invalid runtime: ${$.store_get($$store_subs ??= {}, '$func', func).runtime}`);
				}

				await sdk.forProject(page.params.region, page.params.project).functions.update({
					functionId,
					name: functionName,
					runtime: $.store_get($$store_subs ??= {}, '$func', func).runtime,
					execute: $.store_get($$store_subs ??= {}, '$func', func).execute || undefined,
					events: $.store_get($$store_subs ??= {}, '$func', func).events || undefined,
					schedule: $.store_get($$store_subs ??= {}, '$func', func).schedule || undefined,
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
				addNotification({ message: 'Name has been updated', type: 'success' });
				trackEvent(Submit.FunctionUpdateName);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.FunctionUpdateName);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateName,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						$$slots: {
							title: ($$renderer) => {
								{
									$$renderer.push(`Name`);
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										id: 'name',
										label: 'Name',
										placeholder: 'Enter name',
										required: true,
										get value() {
											return functionName;
										},

										set value($$value) {
											functionName = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: functionName === $.store_get($$store_subs ??= {}, '$func', func).name || !functionName,
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