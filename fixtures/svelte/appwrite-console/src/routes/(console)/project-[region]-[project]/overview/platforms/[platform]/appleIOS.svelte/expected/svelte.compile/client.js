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

export default function AppleIOS($$anchor, $$props) {
	$.push($$props, true);

	const $platform = () => $.store_get(platform, '$platform', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let bundleIdentifier = null;

	onMount(() => {
		bundleIdentifier ??= $platform().bundleIdentifier;
	});

	async function updateBundleIdentifier() {
		try {
			await sdk.forProject($project().region, $project().$id).project.updateApplePlatform({
				platformId: $platform().$id,
				name: $platform().name,
				bundleIdentifier
			});

			await invalidate(Dependencies.PLATFORM);
			trackEvent(Submit.PlatformUpdate, { type: 'apple' });

			addNotification({
				type: 'success',
				message: 'Platform Bundle ID has been updated'
			});
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.PlatformUpdate);
		}
	}

	Form($$anchor, {
		onSubmit: updateBundleIdentifier,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('You can find your Bundle Identifier in the General tab for your app\'s primary target in Xcode.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Bundle ID');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputText($$anchor, {
							id: 'bundle-id',
							label: 'Bundle ID',
							required: true,
							placeholder: 'com.company.appname',
							get value() {
								return bundleIdentifier;
							},

							set value($$value) {
								bundleIdentifier = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => bundleIdentifier === $platform().bundleIdentifier);

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