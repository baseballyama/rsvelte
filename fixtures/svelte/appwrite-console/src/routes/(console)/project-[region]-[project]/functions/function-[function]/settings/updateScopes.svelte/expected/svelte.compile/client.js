import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(
	`Select scopes to grant the dynamic key generated temporarily for your function. It is best practice
        to allow only necessary permissions. <!>.`,
	1
);

export default function UpdateScopes($$anchor, $$props) {
	$.push($$props, true);

	const $func = () => $.store_get(func, '$func', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const functionId = page.params.function;
	let functionScopes = null;

	onMount(async () => {
		functionScopes ??= $func().scopes;
	});

	async function updateScopes() {
		try {
			if (!isValueOfStringEnum(Runtime, $func().runtime)) {
				throw new Error(`Invalid runtime: ${$func().runtime}`);
			}

			await sdk.forProject(page.params.region, page.params.project).functions.update({
				functionId,
				name: $func().name,
				runtime: $func().runtime,
				execute: $func().execute || undefined,
				events: $func().events || undefined,
				schedule: $func().schedule || undefined,
				timeout: $func().timeout || undefined,
				enabled: $func().enabled ?? undefined,
				logging: $func().logging ?? undefined,
				entrypoint: $func().entrypoint || undefined,
				commands: $func().commands || undefined,
				scopes: functionScopes || undefined,
				installationId: $func().installationId || undefined,
				providerRepositoryId: $func().providerRepositoryId || undefined,
				providerBranch: $func().providerBranch || undefined,
				providerSilentMode: $func().providerSilentMode ?? undefined,
				providerRootDirectory: $func().providerRootDirectory || undefined,
				buildSpecification: $func().buildSpecification || undefined,
				deploymentRetention: $func().deploymentRetention ?? undefined
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

	Form($$anchor, {
		onSubmit: updateScopes,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node = $.sibling($.first_child(fragment_2));

					Link(node, {
						href: 'https://appwrite.io/docs/advanced/platform/api-keys#scopes',
						external: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Learn more');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.next();
					$.append($$anchor, fragment_2);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Scopes');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_1 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								Scopes($$anchor, {
									get scopes() {
										return functionScopes;
									},

									set scopes($$value) {
										functionScopes = $$value;
									}
								});
							};

							$.if(node_1, ($$render) => {
								if (functionScopes !== null) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => functionScopes && $func()?.scopes && !symmetricDifference(functionScopes, $func()?.scopes).length);

							Button($$anchor, {
								submit: true,
								get disabled() {
									return $.get($0);
								},

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
	$$cleanup();
}