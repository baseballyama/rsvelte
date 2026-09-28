import * as $ from 'svelte/internal/server';
import { getPageDetails } from '$lib/utils/nav-helpers';
import DNSSPFBuilder from '$lib/components/tools/DNSSPFBuilder.svelte';
import '../../../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _pageDetails = getPageDetails('/dns/generators/spf-builder');

		DNSSPFBuilder($$renderer, {});
	});
}