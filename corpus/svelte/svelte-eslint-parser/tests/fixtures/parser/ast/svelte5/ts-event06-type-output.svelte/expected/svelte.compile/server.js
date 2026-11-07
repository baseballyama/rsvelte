import * as $ from 'svelte/internal/server';
import Component from './ts-event03-input.svelte';

export default function Ts_event06_type_output($$renderer) {
	Component($$renderer, {
		onfoo: // Component: Component<$$ComponentProps, {}, "">
		(e) => {
			// Component: Component<$$ComponentProps, {}, "">, e: { detail: number; }
			// e.detail is number
			e.detail; // e.detail: number
		}
	});
}