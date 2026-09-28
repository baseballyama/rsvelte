import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { project } from '../../../store';
import { platform } from './store';

export default function FlutterWindows($$anchor, $$props) {
	$.push($$props, true);

	const $platform = () => $.store_get(platform, '$platform', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let packageIdentifierName = null;

	onMount(() => {
		packageIdentifierName ??= $platform().packageIdentifierName;
	});

	async function updatePackageIdentifierName() {
		try {
			await sdk.forProject($project().region, $project().$id).project.updateWindowsPlatform({
				platformId: $platform().$id,
				name: $platform().name,
				packageIdentifierName
			});

			await invalidate(Dependencies.PLATFORM);
			trackEvent(Submit.PlatformUpdate, { type: 'windows' });

			addNotification({
				type: 'success',
				message: 'Platform Package Name has been updated'
			});
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.PlatformUpdate);
		}
	}

	Form($$anchor, {
		onSubmit: updatePackageIdentifierName,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Your application name.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Package name');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputText($$anchor, {
							id: 'package-name',
							label: 'Package Name',
							required: true,
							placeholder: 'appname',
							get value() {
								return packageIdentifierName;
							},

							set value($$value) {
								packageIdentifierName = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => packageIdentifierName === $platform().packageIdentifierName);

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