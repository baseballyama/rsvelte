import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PreviewComponent from "$lib/components/veil/call-to-action/call-to-action-one.svelte";

export default function _page($$anchor) {
	PreviewComponent($$anchor, {});
}