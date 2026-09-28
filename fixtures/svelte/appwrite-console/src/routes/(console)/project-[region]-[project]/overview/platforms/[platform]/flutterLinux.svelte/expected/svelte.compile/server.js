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

export default function FlutterLinux($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let packageName = null;

		onMount(() => {
			packageName ??= $.store_get($$store_subs ??= {}, '$platform', platform).packageName;
		});

		async function updatePackageName() {
			try {
				await sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id).project.updateLinuxPlatform({
					platformId: $.store_get($$store_subs ??= {}, '$platform', platform).$id,
					name: $.store_get($$store_subs ??= {}, '$platform', platform).name,
					packageName
				});

				await invalidate(Dependencies.PLATFORM);
				trackEvent(Submit.PlatformUpdate, { type: 'linux' });

				addNotification({
					type: 'success',
					message: 'Platform Package Name has been updated'
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
				onSubmit: updatePackageName,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Your application name.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Package name`);
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										id: 'package-name',
										label: 'Package Name',
										required: true,
										placeholder: 'appname',
										get value() {
											return packageName;
										},

										set value($$value) {
											packageName = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: packageName === $.store_get($$store_subs ??= {}, '$platform', platform).packageName,
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