import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';

export default function Component_events01_input($$renderer) {
	function handleMessage(event) {
		alert(event.detail.text);
	}

	Inner($$renderer, {});
}