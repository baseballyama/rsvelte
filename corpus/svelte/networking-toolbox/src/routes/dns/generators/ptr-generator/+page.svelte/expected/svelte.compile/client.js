import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PTRGenerator from '$lib/components/tools/PTRGenerator.svelte';

export default function _page($$anchor) {
	PTRGenerator($$anchor, {});
}