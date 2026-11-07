import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NameLengthChecker from '$lib/components/tools/NameLengthChecker.svelte';

export default function _page($$anchor) {
	NameLengthChecker($$anchor, {});
}