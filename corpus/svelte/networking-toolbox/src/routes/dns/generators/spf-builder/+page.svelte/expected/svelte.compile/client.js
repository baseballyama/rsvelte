import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPageDetails } from '$lib/utils/nav-helpers';
import DNSSPFBuilder from '$lib/components/tools/DNSSPFBuilder.svelte';
import '../../../../styles/pages.scss';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const _pageDetails = getPageDetails('/dns/generators/spf-builder');

	DNSSPFBuilder($$anchor, {});
	$.pop();
}