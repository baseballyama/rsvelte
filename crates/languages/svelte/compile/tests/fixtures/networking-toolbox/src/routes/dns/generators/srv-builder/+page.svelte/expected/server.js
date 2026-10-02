import * as $ from 'svelte/internal/server';
import { getPageDetails } from '$lib/utils/nav-helpers';
import DNSSRVBuilder from '$lib/components/tools/DNSSRVBuilder.svelte';
import '../../../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _pageDetails = getPageDetails('/dns/generators/srv-builder');

		DNSSRVBuilder($$renderer, {});
	});
}