import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './ts-event03-input.svelte';

export default function Ts_event06_type_output($$anchor) {
	// Component: __sveltets_2_IsomorphicComponent<{}, { foo: CustomEvent<number>; bar: CustomEvent<string>; } & { [evt: string]: CustomEvent<any>; }, {}, Record<string, any>, string>
	Component($$anchor, {
		$$events: {
			foo: (e) => {
				// Component: __sveltets_2_IsomorphicComponent<{}, { foo: CustomEvent<number>; bar: CustomEvent<string>; } & { [evt: string]: CustomEvent<any>; }, {}, Record<string, any>, string>, e: CustomEvent<number>
				// e.detail is number
				e.detail; // e.detail: number
			}
		}
	});
}