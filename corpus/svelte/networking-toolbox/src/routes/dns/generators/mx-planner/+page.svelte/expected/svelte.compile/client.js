import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPageDetails } from '$lib/utils/nav-helpers';
import DNSMXPlanner from '$lib/components/tools/DNSMXPlanner.svelte';
import '../../../../styles/pages.scss';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const _pageDetails = getPageDetails('/dns/generators/mx-planner');

	DNSMXPlanner($$anchor, {});
	$.pop();
}