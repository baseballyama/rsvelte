import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SSHFPGenerator from '$lib/components/tools/SSHFPGenerator.svelte';

export default function _page($$anchor) {
	SSHFPGenerator($$anchor, {});
}