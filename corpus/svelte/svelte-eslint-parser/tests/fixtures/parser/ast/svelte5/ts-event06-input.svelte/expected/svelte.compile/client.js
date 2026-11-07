import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './ts-event03-input.svelte';

export default function Ts_event06_input($$anchor) {
	Component($$anchor, {
		onfoo: (e) => {
			// e.detail is number
			e.detail;
		}
	});
}