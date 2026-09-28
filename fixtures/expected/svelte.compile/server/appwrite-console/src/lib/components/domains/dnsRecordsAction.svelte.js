import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { getApexDomain } from '$lib/helpers/tlds';
import { isCloud } from '$lib/system';
import { IconDocumentText } from '@appwrite.io/pink-icons-svelte';
import { ActionMenu } from '@appwrite.io/pink-svelte';

export default function DnsRecordsAction($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { rule, organizationDomains } = $$props;

		const dnsData = $.derived(() => {
			if (!isCloud || !organizationDomains) {
				return null;
			}

			const apexDomain = getApexDomain(rule.domain);

			if (!apexDomain) return null;

			const domain = organizationDomains.domains.find((d) => d.domain === apexDomain);

			if (!domain) return null;

			return `${base}/organization-${domain.teamId}/domains/domain-${domain.$id}`;
		});

		if (dnsData()) {
			$$renderer.push('<!--[0-->');

			if (ActionMenu.Item.Anchor) {
				$$renderer.push('<!--[-->');

				ActionMenu.Item.Anchor($$renderer, {
					leadingIcon: IconDocumentText,
					href: dnsData(),
					children: ($$renderer) => {
						$$renderer.push(`<!---->DNS records`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}