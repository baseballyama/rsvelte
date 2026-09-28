import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { project } from '../../../store';
import { platform } from './store';
import { extendedHostnameRegex } from '$lib/helpers/string';

export default function Web($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let hostname = null;

		onMount(() => {
			hostname ??= $.store_get($$store_subs ??= {}, '$platform', platform).hostname;
		});

		async function updateHostname() {
			try {
				await sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id).project.updateWebPlatform({
					platformId: $.store_get($$store_subs ??= {}, '$platform', platform).$id,
					name: $.store_get($$store_subs ??= {}, '$platform', platform).name,
					hostname
				});

				await invalidate(Dependencies.PLATFORM);

				addNotification({
					type: 'success',
					message: 'Platform hostname has been updated'
				});
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateHostname,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->You can use * to allow wildcard hostnames or subdomains.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Hostname`);
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										id: 'hostname',
										label: 'Hostname',
										pattern: extendedHostnameRegex,
										patternError: 'Please enter a valid hostname',
										required: true,
										placeholder: 'myapp.com',
										get value() {
											return hostname;
										},

										set value($$value) {
											hostname = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: hostname === $.store_get($$store_subs ??= {}, '$platform', platform).hostname,
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