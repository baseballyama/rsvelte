import * as $ from 'svelte/internal/server';
import AnotherRefFormatDate from './another-ref-format-date.svelte';

export default function Outgoing_component($$renderer) {
	function hi() {
		log('hi');
	}

	function log(msg) {}

	AnotherRefFormatDate($$renderer, {});
}