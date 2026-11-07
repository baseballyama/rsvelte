import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DHCPv6FQDN from '$lib/components/tools/DHCPv6FQDN.svelte';

var root = $.from_html(`<meta name="description" content="Configure DHCPv6 Client FQDN Option (Option 39) for dynamic DNS updates. Build fully qualified domain name options with S, O, and N flags per RFC 4704."/> <meta name="keywords" content="dhcpv6, fqdn, option 39, client fqdn, dynamic dns, ddns, ipv6, rfc 4704, dns updates, hostname, wire format, kea, isc, flags"/>`, 1);

export default function _page($$anchor) {
	$.head('1pp5huq', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'DHCPv6 Client FQDN Option (Option 39) - RFC 4704 | IP Calc';
		});

		$.append($$anchor, fragment);
	});

	DHCPv6FQDN($$anchor, {});
}