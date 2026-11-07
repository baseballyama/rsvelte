import * as $ from 'svelte/internal/server';
import Untyped from './untyped-js.svelte';

export default function Input($$renderer) {
	Untyped($$renderer, {
		untyped: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { untyped }) => {
				$$renderer.push(`<!---->${$.escape(untyped.worksBecauseAny)}`);
			}
		}
	});
}