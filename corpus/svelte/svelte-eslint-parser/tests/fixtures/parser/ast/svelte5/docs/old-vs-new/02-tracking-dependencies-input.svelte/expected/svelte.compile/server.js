import * as $ from 'svelte/internal/server';

export default function _2_tracking_dependencies_input($$renderer) {
	let a = 0;
	let b = 0;
	let sum = $.derived(add);

	function add() {
		return a + b;
	}

	$$renderer.push(`<button>a++</button> <button>b++</button> <p>${$.escape(a)} + ${$.escape(b)} = ${$.escape(sum())}</p>`);
}