import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AnotherRefFormatDate from './another-ref-format-date.svelte';

export default function Outgoing_component($$anchor) {
	function hi() {
		log('hi');
	}

	function log(msg) {}

	AnotherRefFormatDate($$anchor, {});
}