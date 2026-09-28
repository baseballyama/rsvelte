import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SubnetCalculator from '$lib/components/tools/SubnetCalculator.svelte';
import '../../../styles/pages.scss';

export default function _page($$anchor) {
	SubnetCalculator($$anchor, {});
}