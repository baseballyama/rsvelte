import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WizardStep } from '$lib/layout';
import { sdk } from '$lib/stores/sdk';
import { formData, provider, selectedProject } from '.';
import ResourceForm from './resource-form.svelte';

var root = $.from_html(
	`Select the resources you need to migrate to Appwrite. Some resources can be migrated, but
        with limitations. <a class="link" href="https://appwrite.io/docs/advanced/migrations" target="_blank" rel="noopener noreferrer">Learn about which resources are supported</a>.`,
	1
);

export default function Step2($$anchor, $$props) {
	$.push($$props, true);

	const $selectedProject = () => $.store_get(selectedProject, '$selectedProject', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	WizardStep($$anchor, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => sdk.forProject('fra1', $selectedProject()));

				ResourceForm($$anchor, {
					get provider() {
						return provider;
					},

					get formData() {
						return formData;
					},

					get projectSdk() {
						return $.get($0);
					}
				});
			}
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text = $.text('Resources');

				$.append($$anchor, text);
			},

			subtitle: ($$anchor, $$slotProps) => {
				var fragment_2 = root();

				$.next(2);
				$.append($$anchor, fragment_2);
			}
		}
	});

	$.pop();
	$$cleanup();
}