import * as $ from 'svelte/internal/server';
import Outer from './Outer.svelte';

export default function Event_forwarding01_input($$renderer) {
	function handleMessage(event) {
		alert(event.detail.text);
	}

	Outer($$renderer, {});
}