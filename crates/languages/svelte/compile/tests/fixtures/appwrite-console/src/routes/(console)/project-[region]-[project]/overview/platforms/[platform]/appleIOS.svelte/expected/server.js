import * as $ from 'svelte/internal/server';
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

export default function AppleIOS($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let bundleIdentifier = null;

		onMount(() => {
			bundleIdentifier ??= $.store_get($$store_subs ??= {}, '$platform', platform).bundleIdentifier;
		});

		async function updateBundleIdentifier() {
			try {
				await sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id).project.updateApplePlatform({
					platformId: $.store_get($$store_subs ??= {}, '$platform', platform).$id,
					name: $.store_get($$store_subs ??= {}, '$platform', platform).name,
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateBundleIdentifier,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->You can find your Bundle Identifier in the General tab for your app's primary target in Xcode.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Bundle ID`);
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										id: 'bundle-id',
										label: 'Bundle ID',
										required: true,
										placeholder: 'com.company.appname',
										get value() {
											return bundleIdentifier;
										},

										set value($$value) {
											bundleIdentifier = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: bundleIdentifier === $.store_get($$store_subs ??= {}, '$platform', platform).bundleIdentifier,
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