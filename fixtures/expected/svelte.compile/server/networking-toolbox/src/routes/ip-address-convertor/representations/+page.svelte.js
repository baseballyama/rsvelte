import * as $ from 'svelte/internal/server';
import IPConverter from '$lib/components/tools/IPConverter.svelte';
import '../../../styles/pages.scss';

export default function _page($$renderer) {
	IPConverter($$renderer, {});
}