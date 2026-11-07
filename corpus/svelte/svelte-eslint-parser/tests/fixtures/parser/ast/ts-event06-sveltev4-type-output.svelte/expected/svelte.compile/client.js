import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './ts-event03-input.svelte';

export default function Ts_event06_sveltev4_type_output($$anchor) {
	// Component: typeof SvelteComponent
	Component($$anchor, {
		$$events: {
			foo: (e) => {
				// Component: typeof SvelteComponent, e: CustomEvent<any>
				// e.detail is number
				e.detail; // e.detail: any
			}
		}
	});
}