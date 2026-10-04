import * as $ from 'svelte/internal/server';

export default function Globals_function_binding($$renderer) {
	let x = 0;
	function get() {
		return x;
	}
	function set(value) {
		x = value;
	}
}
