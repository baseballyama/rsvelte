import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VLSMCalculator from '$lib/components/tools/VLSMCalculator.svelte';
import '../../../styles/pages.scss';

export default function _page($$anchor) {
	VLSMCalculator($$anchor, {});
}