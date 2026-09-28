import * as $ from 'svelte/internal/server';
import DNSRecordValidator from '$lib/components/tools/DNSRecordValidator.svelte';

export default function _page($$renderer) {
	DNSRecordValidator($$renderer, {});
}