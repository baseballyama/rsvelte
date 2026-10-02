import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './ts-event03-input.svelte';

export default function Ts_event06_type_output($$anchor) {
	// Component: Component<$$ComponentProps, {}, "">
	Component($$anchor, {
		onfoo: (e) => {
			// Component: Component<$$ComponentProps, {}, "">, e: { detail: number; }
			// e.detail is number
			e.detail; // e.detail: number
		}
	});
}