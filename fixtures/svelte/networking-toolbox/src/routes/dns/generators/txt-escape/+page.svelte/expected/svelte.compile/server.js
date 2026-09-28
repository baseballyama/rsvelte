import * as $ from 'svelte/internal/server';
import { getPageDetails } from '$lib/utils/nav-helpers';
import DNSTXTEscape from '$lib/components/tools/DNSTXTEscape.svelte';
import '../../../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _pageDetails = getPageDetails('/dns/generators/txt-escape');

		DNSTXTEscape($$renderer, {});
	});
}