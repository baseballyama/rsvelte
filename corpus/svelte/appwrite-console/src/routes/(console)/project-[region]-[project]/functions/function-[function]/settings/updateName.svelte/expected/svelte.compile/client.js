import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function UpdateName($$anchor, $$props) {
	$.push($$props, true);

	const $func = () => $.store_get(func, '$func', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const functionId = page.params.function;
	let functionName = null;

	onMount(async () => {
		functionName ??= $func().name;
	});

	async function updateName() {
		try {
			if (!isValueOfStringEnum(Runtime, $func().runtime)) {
				throw new Error(`Invalid runtime: ${$func().runtime}`);
			}

			await sdk.forProject(page.params.region, page.params.project).functions.update({
				functionId,
				name: functionName,
				runtime: $func().runtime,
				execute: $func().execute || undefined,
				events: $func().events || undefined,
				schedule: $func().schedule || undefined,
				timeout: $func().timeout || undefined,
				enabled: $func().enabled ?? undefined,
				logging: $func().logging ?? undefined,
				entrypoint: $func().entrypoint || undefined,
				commands: $func().commands || undefined,
				scopes: $func().scopes || undefined,
				installationId: $func().installationId || undefined,
				providerRepositoryId: $func().providerRepositoryId || undefined,
				providerBranch: $func().providerBranch || undefined,
				providerSilentMode: $func().providerSilentMode ?? undefined,
				providerRootDirectory: $func().providerRootDirectory || undefined,
				buildSpecification: $func().buildSpecification || undefined,
				deploymentRetention: $func().deploymentRetention ?? undefined
			});

			await invalidate(Dependencies.FUNCTION);
			addNotification({ message: 'Name has been updated', type: 'success' });
			trackEvent(Submit.FunctionUpdateName);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.FunctionUpdateName);
		}
	}

	Form($$anchor, {
		onSubmit: updateName,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var text = $.text('Name');

						$.append($$anchor, text);
					},

					aside: ($$anchor, $$slotProps) => {
						InputText($$anchor, {
							id: 'name',
							label: 'Name',
							placeholder: 'Enter name',
							required: true,
							get value() {
								return functionName;
							},

							set value($$value) {
								functionName = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => functionName === $func().name || !functionName);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Update');

									$.append($$anchor, text_1);
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