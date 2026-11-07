import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Web($$anchor, $$props) {
	$.push($$props, true);

	const $platform = () => $.store_get(platform, '$platform', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let hostname = null;

	onMount(() => {
		hostname ??= $platform().hostname;
	});

	async function updateHostname() {
		try {
			await sdk.forProject($project().region, $project().$id).project.updateWebPlatform({
				platformId: $platform().$id,
				name: $platform().name,
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

	Form($$anchor, {
		onSubmit: updateHostname,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('You can use * to allow wildcard hostnames or subdomains.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Hostname');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputText($$anchor, {
							id: 'hostname',
							label: 'Hostname',
							get pattern() {
								return extendedHostnameRegex;
							},
							patternError: 'Please enter a valid hostname',
							required: true,
							placeholder: 'myapp.com',
							get value() {
								return hostname;
							},

							set value($$value) {
								hostname = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => hostname === $platform().hostname);

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