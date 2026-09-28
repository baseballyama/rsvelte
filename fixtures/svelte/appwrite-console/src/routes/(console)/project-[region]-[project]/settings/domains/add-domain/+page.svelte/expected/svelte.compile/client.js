import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $project = () => $.store_get(project, '$project', $$stores);
	const $isSubmitting = () => $.store_get($.get(isSubmitting), '$isSubmitting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const routeBase = `${base}/project-${page.params.region}-${page.params.project}/settings/domains`;
	let formComponent;
	let isSubmitting = $.state($.proxy(writable(false)));
	let domainName = $.state('');

	onMount(() => {
		if (page.url.searchParams.has('domain')) {
			$.set(domainName, page.url.searchParams.get('domain'), true);
		}
	});

	async function addDomain() {
		const apexDomain = getApexDomain($.get(domainName));
		const domain = $$props.data.domainsList.domains.find((d) => d.domain === apexDomain);

		if (apexDomain && !domain && isCloud) {
			try {
				await sdk.forConsole.domains.create({ teamId: $project().teamId, domain: apexDomain });
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
			const rule = await sdk.forProject(page.params.region, page.params.project).proxy.createAPIRule({ domain: $.get(domainName).toLocaleLowerCase() });

			await invalidate(Dependencies.DOMAINS);

			const verified = isProxyRuleVerified(rule?.status);

			if (verified) {
				addNotification({ type: 'success', message: 'Domain verified successfully' });
				await goto(routeBase);
			} else {
				await goto(`${routeBase}/add-domain/verify-${$.get(domainName)}?rule=${rule.$id}`);
			}
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
		}
	}

	Wizard($$anchor, {
		title: 'Add domain',
		get href() {
			return routeBase;
		},
		column: true,
		columnSize: 's',
		confirmExit: true,
		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Form($$anchor, {
					onSubmit: addDomain,
					get isSubmitting() {
						return $.get(isSubmitting);
					},

					set isSubmitting($$value) {
						$.store_unsub($.set(isSubmitting, $$value, true), '$isSubmitting', $$stores);
					},

					children: ($$anchor, $$slotProps) => {
						InputDomain($$anchor, {
							label: 'Domain',
							id: 'domain',
							required: true,
							autofocus: true,
							placeholder: 'appwrite.example.com',
							get value() {
								return $.get(domainName);
							},

							set value($$value) {
								$.set(domainName, $$value, true);
							}
						});
					},
					$$slots: { default: true }
				}),
				($$value) => formComponent = $$value,
				() => formComponent
			);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node = $.first_child(fragment_3);

				Button(node, {
					secondary: true,
					get href() {
						return routeBase;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				Button(node_1, {
					get disabled() {
						$.mark_store_binding();

						return $isSubmitting();
					},

					set disabled($$value) {
						$.store_set($.get(isSubmitting), $$value);
					},
					$$events: { click: () => formComponent.triggerSubmit() },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Add');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_3);
			}
		}
	});

	$.pop();
	$$cleanup();
}