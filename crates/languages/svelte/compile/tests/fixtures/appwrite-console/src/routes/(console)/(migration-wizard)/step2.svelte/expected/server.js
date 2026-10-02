import * as $ from 'svelte/internal/server';
import { WizardStep } from '$lib/layout';
import { sdk } from '$lib/stores/sdk';
import { formData, provider, selectedProject } from '.';
import ResourceForm from './resource-form.svelte';

export default function Step2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		WizardStep($$renderer, {
			children: ($$renderer) => {
				ResourceForm($$renderer, {
					provider,
					formData,
					projectSdk: sdk.forProject('fra1', $.store_get($$store_subs ??= {}, '$selectedProject', selectedProject))
				});
			},

			$$slots: {
				default: true,
				title: ($$renderer) => {
					{
						$$renderer.push(`Resources`);
					}
				},

				subtitle: ($$renderer) => {
					{
						$$renderer.push(`Select the resources you need to migrate to Appwrite. Some resources can be migrated, but
        with limitations. <a class="link" href="https://appwrite.io/docs/advanced/migrations" target="_blank" rel="noopener noreferrer">Learn about which resources are supported</a>.`);
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}