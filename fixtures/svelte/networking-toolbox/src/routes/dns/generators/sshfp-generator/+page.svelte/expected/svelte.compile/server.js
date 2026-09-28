import * as $ from 'svelte/internal/server';
import SSHFPGenerator from '$lib/components/tools/SSHFPGenerator.svelte';

export default function _page($$renderer) {
	SSHFPGenerator($$renderer, {});
}