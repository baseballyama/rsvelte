import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PreviewComponent from "$lib/components/veil/pricing/pricing-three.svelte";

export default function _page($$anchor) {
	PreviewComponent($$anchor, {});
}