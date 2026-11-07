import * as $ from 'svelte/internal/server';
import * as Alert from "$lib/registry/ui/alert/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Alert_destructive($$renderer) {
	Example($$renderer, {
		title: 'Destructive',
		children: ($$renderer) => {
			$$renderer.push(`<div class="mx-auto flex w-full max-w-lg flex-col gap-4">`);

			if (Alert.Root) {
				$$renderer.push('<!--[-->');

				Alert.Root($$renderer, {
					variant: 'destructive',
					children: ($$renderer) => {
						IconPlaceholder($$renderer, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						$$renderer.push(`<!----> `);

						if (Alert.Title) {
							$$renderer.push('<!--[-->');

							Alert.Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Something went wrong!`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Alert.Description) {
							$$renderer.push('<!--[-->');

							Alert.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Your session has expired. Please log in again.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Alert.Root) {
				$$renderer.push('<!--[-->');

				Alert.Root($$renderer, {
					variant: 'destructive',
					children: ($$renderer) => {
						IconPlaceholder($$renderer, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						$$renderer.push(`<!----> `);

						if (Alert.Title) {
							$$renderer.push('<!--[-->');

							Alert.Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Unable to process your payment.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Alert.Description) {
							$$renderer.push('<!--[-->');

							Alert.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p>Please verify your <a href="#/">billing information</a> and try again.</p> <ul class="list-inside list-disc"><li>Check your card details</li> <li>Ensure sufficient funds</li> <li>Verify billing address</li></ul>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		},
		$$slots: { default: true }
	});
}