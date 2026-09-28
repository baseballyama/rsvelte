import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DNSRecordValidator from '$lib/components/tools/DNSRecordValidator.svelte';

export default function _page($$anchor) {
	DNSRecordValidator($$anchor, {});
}