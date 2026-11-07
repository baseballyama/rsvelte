import * as $ from 'svelte/internal/server';
import { getPageDetails } from '$lib/utils/nav-helpers';
import DNSAAAAABulk from '$lib/components/tools/DNSAAAAABulk.svelte';
import '../../../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _pageDetails = getPageDetails('/dns/generators/a-aaaa-bulk');

		DNSAAAAABulk($$renderer, {});
	});
}