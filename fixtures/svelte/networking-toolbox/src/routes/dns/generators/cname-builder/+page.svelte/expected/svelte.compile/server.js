import * as $ from 'svelte/internal/server';
import { getPageDetails } from '$lib/utils/nav-helpers';
import DNSCNAMEBuilder from '$lib/components/tools/DNSCNAMEBuilder.svelte';
import '../../../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _pageDetails = getPageDetails('/dns/generators/cname-builder');

		DNSCNAMEBuilder($$renderer, {});
	});
}