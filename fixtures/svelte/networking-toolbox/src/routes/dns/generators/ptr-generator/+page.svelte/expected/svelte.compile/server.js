import * as $ from 'svelte/internal/server';
import PTRGenerator from '$lib/components/tools/PTRGenerator.svelte';

export default function _page($$renderer) {
	PTRGenerator($$renderer, {});
}