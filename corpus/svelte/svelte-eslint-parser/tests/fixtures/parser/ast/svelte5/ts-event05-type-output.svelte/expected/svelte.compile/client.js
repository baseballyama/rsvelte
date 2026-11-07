import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './ts-event03-input.svelte';

export default function Ts_event05_type_output($$anchor) {
	// Component: LegacyComponentType
	Component($$anchor, {
		onfoo: (e) => {
			// Component: LegacyComponentType, e: any
			// e.detail is number
			//   `@typescript-eslint/parser` doesn't get the correct types.
			//   Using `typescript-eslint-parser-for-extra-files` will give we the correct types.
			//   See `ts-event06-input.svelte` test case
			e.detail; // e.detail: any
		}
	});
}