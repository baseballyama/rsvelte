import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { func } from '../store';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { Runtime } from '@appwrite.io/console';
import Scopes from '$routes/(console)/project-[region]-[project]/overview/api-keys/scopes.svelte';
import { symmetricDifference } from '$lib/helpers/array';
import { Link } from '$lib/elements';

export default function UpdateScopes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const functionId = page.params.function;
		let functionScopes = null;

		onMount(async () => {
			functionScopes ??= $.store_get($$store_subs ??= {}, '$func', func).scopes;
		});

		async function updateScopes() {
			try {
				if (!isValueOfStringEnum(Runtime, $.store_get($$store_subs ??= {}, '$func', func).runtime)) {
					throw new Error(`Invalid runtime: ${$.store_get($$store_subs ??= {}, '$func', func).runtime}`);
				}

				await sdk.forProject(page.params.region, page.params.project).functions.update({
					functionId,
					name: $.store_get($$store_subs ??= {}, '$func', func).name,
					runtime: $.store_get($$store_subs ??= {}, '$func', func).runtime,
					execute: $.store_get($$store_subs ??= {}, '$func', func).execute || undefined,
					events: $.store_get($$store_subs ??= {}, '$func', func).events || undefined,
					schedule: $.store_get($$store_subs ??= {}, '$func', func).schedule || undefined,
					timeout: $.store_get($$store_subs ??= {}, '$func', func).timeout || undefined,
					enabled: $.store_get($$store_subs ??= {}, '$func', func).enabled ?? undefined,
					logging: $.store_get($$store_subs ??= {}, '$func', func).logging ?? undefined,
					entrypoint: $.store_get($$store_subs ??= {}, '$func', func).entrypoint || undefined,
					commands: $.store_get($$store_subs ??= {}, '$func', func).commands || undefined,
					scopes: functionScopes || undefined,
					installationId: $.store_get($$store_subs ??= {}, '$func', func).installationId || undefined,
					providerRepositoryId: $.store_get($$store_subs ??= {}, '$func', func).providerRepositoryId || undefined,
					providerBranch: $.store_get($$store_subs ??= {}, '$func', func).providerBranch || undefined,
					providerSilentMode: $.store_get($$store_subs ??= {}, '$func', func).providerSilentMode ?? undefined,
					providerRootDirectory: $.store_get($$store_subs ??= {}, '$func', func).providerRootDirectory || undefined,
					buildSpecification: $.store_get($$store_subs ??= {}, '$func', func).buildSpecification || undefined,
					deploymentRetention: $.store_get($$store_subs ??= {}, '$func', func).deploymentRetention ?? undefined
				});

				await invalidate(Dependencies.FUNCTION);

				addNotification({
					type: 'success',
					message: 'Function scopes have been updated'
				});

				trackEvent(Submit.FunctionUpdateScopes, { scopes: functionScopes });
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.FunctionUpdateScopes);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateScopes,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select scopes to grant the dynamic key generated temporarily for your function. It is best practice
        to allow only necessary permissions. `);

							Link($$renderer, {
								href: 'https://appwrite.io/docs/advanced/platform/api-keys#scopes',
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
									$$renderer.push(`Scopes`);
								}
							},

							aside: ($$renderer) => {
								{
									if (functionScopes !== null) {
										$$renderer.push('<!--[0-->');

										Scopes($$renderer, {
											get scopes() {
												return functionScopes;
											},

											set scopes($$value) {
												functionScopes = $$value;
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
										submit: true,
										disabled: functionScopes && $.store_get($$store_subs ??= {}, '$func', func)?.scopes && !symmetricDifference(functionScopes, $.store_get($$store_subs ??= {}, '$func', func)?.scopes).length,
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