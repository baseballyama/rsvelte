import * as $ from 'svelte/internal/server';
import PreviewComponent from "$lib/components/veil/integration/integration-one.svelte";

export default function _page($$renderer) {
	PreviewComponent($$renderer, {});
}