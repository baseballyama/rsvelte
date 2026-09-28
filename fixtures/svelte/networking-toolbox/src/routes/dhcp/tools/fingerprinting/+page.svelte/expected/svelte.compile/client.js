import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DHCPFingerprinting from '$lib/components/tools/DHCPFingerprinting.svelte';

var root = $.from_html(`<meta name="description" content="Identify devices based on their DHCP fingerprints using Parameter Request List (Option 55) and Vendor Class Identifier (Option 60). Search through a comprehensive database of known device signatures."/> <meta name="keywords" content="dhcp, fingerprinting, device identification, parameter request list, option 55, option 60, vendor class, network discovery, device detection"/>`, 1);

export default function _page($$anchor) {
	$.head('11enh83', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'DHCP Fingerprinting Database | IP Calc';
		});

		$.append($$anchor, fragment);
	});

	DHCPFingerprinting($$anchor, {});
}