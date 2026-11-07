import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputNumber } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { func } from '../store';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { Runtime } from '@appwrite.io/console';

export default function UpdateTimeout($$anchor, $$props) {
	$.push($$props, true);

	const $func = () => $.store_get(func, '$func', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const functionId = page.params.function;
	let timeout = null;

	onMount(async () => {
		timeout ??= $func().timeout;
	});

	async function updateTimeout() {
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
				timeout,
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
			addNotification({ type: 'success', message: 'Timeout has been updated' });
			trackEvent(Submit.FunctionUpdateTimeout);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.FunctionUpdateTimeout);
		}
	}

	Form($$anchor, {
		onSubmit: updateTimeout,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Limit the execution time of your function. The maximum value is 900 seconds (15 minutes).');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Timeout');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputNumber($$anchor, {
							min: 1,
							max: 900,
							id: 'time',
							label: 'Time (in seconds)',
							get value() {
								return timeout;
							},

							set value($$value) {
								timeout = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $func().timeout === timeout || timeout < 1);

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
	$$cleanup();
}