import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Button, Form, InputDomain } from '$lib/elements/forms';
import { Wizard } from '$lib/layout';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { goto, invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { writable } from 'svelte/store';
import { onMount } from 'svelte';
import { isCloud } from '$lib/system';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { getApexDomain } from '$lib/helpers/tlds';
import { isProxyRuleVerified } from '$lib/components/domains/status';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const routeBase = `${base}/project-${page.params.region}-${page.params.project}/settings/domains`;
		let { data } = $$props;
		let formComponent;
		let isSubmitting = writable(false);
		let domainName = '';

		onMount(() => {
			if (page.url.searchParams.has('domain')) {
				domainName = page.url.searchParams.get('domain');
			}
		});

		async function addDomain() {
			const apexDomain = getApexDomain(domainName);
			const domain = data.domainsList.domains.find((d) => d.domain === apexDomain);

			if (apexDomain && !domain && isCloud) {
				try {
					await sdk.forConsole.domains.create({
						teamId: $.store_get($$store_subs ??= {}, '$project', project).teamId,
						domain: apexDomain
					});
				} catch(error) {
					// apex might already be added on organization level, skip.
					const alreadyAdded = error?.type === 'domain_already_exists';

					if (!alreadyAdded) {
						addNotification({ type: 'error', message: error.message });

						return;
					}
				}
			}

			try {
				const rule = await sdk.forProject(page.params.region, page.params.project).proxy.createAPIRule({ domain: domainName.toLocaleLowerCase() });

				await invalidate(Dependencies.DOMAINS);

				const verified = isProxyRuleVerified(rule?.status);

				if (verified) {
					addNotification({ type: 'success', message: 'Domain verified successfully' });
					await goto(routeBase);
				} else {
					await goto(`${routeBase}/add-domain/verify-${domainName}?rule=${rule.$id}`);
				}
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Add domain',
				href: routeBase,
				column: true,
				columnSize: 's',
				confirmExit: true,
				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: addDomain,
						get isSubmitting() {
							return isSubmitting;
						},

						set isSubmitting($$value) {
							isSubmitting = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							InputDomain($$renderer, {
								label: 'Domain',
								id: 'domain',
								required: true,
								autofocus: true,
								placeholder: 'appwrite.example.com',
								get value() {
									return domainName;
								},

								set value($$value) {
									domainName = $$value;
									$$settled = false;
								}
							});
						},
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								href: routeBase,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								get disabled() {
									return $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting);
								},

								set disabled($$value) {
									$.store_set(isSubmitting, $$value);
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->Add`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
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