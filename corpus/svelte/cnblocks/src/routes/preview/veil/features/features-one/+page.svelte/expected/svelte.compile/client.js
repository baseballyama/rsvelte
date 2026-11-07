import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PreviewComponent from "$lib/components/veil/features/features-one.svelte";

export default function _page($$anchor) {
	PreviewComponent($$anchor, {});
}