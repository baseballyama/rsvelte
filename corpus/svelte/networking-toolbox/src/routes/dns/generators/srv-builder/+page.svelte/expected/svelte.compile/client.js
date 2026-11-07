import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPageDetails } from '$lib/utils/nav-helpers';
import DNSSRVBuilder from '$lib/components/tools/DNSSRVBuilder.svelte';
import '../../../../styles/pages.scss';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const _pageDetails = getPageDetails('/dns/generators/srv-builder');

	DNSSRVBuilder($$anchor, {});
	$.pop();
}