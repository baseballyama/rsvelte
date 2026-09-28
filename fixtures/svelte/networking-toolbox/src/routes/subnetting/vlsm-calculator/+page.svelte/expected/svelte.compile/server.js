import * as $ from 'svelte/internal/server';
import VLSMCalculator from '$lib/components/tools/VLSMCalculator.svelte';
import '../../../styles/pages.scss';

export default function _page($$renderer) {
	VLSMCalculator($$renderer, {});
}