import * as $ from 'svelte/internal/server';
import NameLengthChecker from '$lib/components/tools/NameLengthChecker.svelte';

export default function _page($$renderer) {
	NameLengthChecker($$renderer, {});
}