import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`Set a Cron schedule to trigger your function. Leave blank for no schedule. <!>.`, 1);

export default function UpdateSchedule($$anchor, $$props) {
	$.push($$props, true);

	const $func = () => $.store_get(func, '$func', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const functionId = page.params.function;
	let functionSchedule = null;

	onMount(async () => {
		functionSchedule ??= $func().schedule;
	});

	async function updateSchedule() {
		try {
			if (!isValueOfStringEnum(Runtime, $func().runtime)) {
				throw new Error(`Invalid runtime: ${$func().runtime}`);
			}

			// an error is shown if invalid.
			parseExpression(functionSchedule);

			await sdk.forProject(page.params.region, page.params.project).functions.update({
				functionId,
				name: $func().name,
				runtime: $func().runtime,
				execute: $func().execute || undefined,
				events: $func().events || undefined,
				schedule: functionSchedule,
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
			addNotification({ type: 'success', message: 'Cron Schedule has been updated' });
			trackEvent(Submit.FunctionUpdateSchedule);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.FunctionUpdateSchedule);
		}
	}

	Form($$anchor, {
		onSubmit: updateSchedule,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node = $.sibling($.first_child(fragment_2));

					Link(node, {
						href: 'https://appwrite.io/docs/products/functions/execution#schedule',
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
						var text_1 = $.text('Schedule');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputCron($$anchor, {
							label: 'Schedule (Cron syntax)',
							id: 'schedule',
							get value() {
								return functionSchedule;
							},

							set value($$value) {
								functionSchedule = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $func().schedule === functionSchedule);

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