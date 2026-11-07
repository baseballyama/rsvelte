import * as $ from 'svelte/internal/server';
import SubnetCalculator from '$lib/components/tools/SubnetCalculator.svelte';
import '../../../styles/pages.scss';

export default function _page($$renderer) {
	SubnetCalculator($$renderer, {});
}