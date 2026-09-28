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

export default function FlutterWindows($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let packageIdentifierName = null;

		onMount(() => {
			packageIdentifierName ??= $.store_get($$store_subs ??= {}, '$platform', platform).packageIdentifierName;
		});

		async function updatePackageIdentifierName() {
			try {
				await sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id).project.updateWindowsPlatform({
					platformId: $.store_get($$store_subs ??= {}, '$platform', platform).$id,
					name: $.store_get($$store_subs ??= {}, '$platform', platform).name,
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updatePackageIdentifierName,
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
											return packageIdentifierName;
										},

										set value($$value) {
											packageIdentifierName = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: packageIdentifierName === $.store_get($$store_subs ??= {}, '$platform', platform).packageIdentifierName,
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