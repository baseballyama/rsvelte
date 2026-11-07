import * as $ from 'svelte/internal/server';

export default function Script_yield_expression01_input($$renderer) {
	function* f() {
		yield* a;
	}
}