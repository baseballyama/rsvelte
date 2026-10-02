import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { getApexDomain } from '$lib/helpers/tlds';
import { isCloud } from '$lib/system';
import { IconDocumentText } from '@appwrite.io/pink-icons-svelte';
import { ActionMenu } from '@appwrite.io/pink-svelte';

export default function DnsRecordsAction($$anchor, $$props) {
	$.push($$props, true);

	const dnsData = $.derived(() => {
		if (!isCloud || !$$props.organizationDomains) {
			return null;
		}

		const apexDomain = getApexDomain($$props.rule.domain);

		if (!apexDomain) return null;

		const domain = $$props.organizationDomains.domains.find((d) => d.domain === apexDomain);

		if (!domain) return null;

		return `${base}/organization-${domain.teamId}/domains/domain-${domain.$id}`;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => ActionMenu.Item.Anchor, ($$anchor, ActionMenu_Item_Anchor) => {
				ActionMenu_Item_Anchor($$anchor, {
					get leadingIcon() {
						return IconDocumentText;
					},

					get href() {
						return $.get(dnsData);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('DNS records');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(dnsData)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}