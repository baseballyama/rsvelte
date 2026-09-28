import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IPConverter from '$lib/components/tools/IPConverter.svelte';
import '../../../styles/pages.scss';

export default function _page($$anchor) {
	IPConverter($$anchor, {});
}