import * as $ from 'svelte/internal/server';

export default function Script_yield_expression01_output($$renderer) {
	function* f() {
		yield* a;
	}
}