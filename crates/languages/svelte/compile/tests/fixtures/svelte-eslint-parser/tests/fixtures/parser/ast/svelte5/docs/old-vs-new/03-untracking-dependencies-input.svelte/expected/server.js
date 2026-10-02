import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';

export default function _3_untracking_dependencies_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let a = 0;
		let b = 0;
		let sum = $.derived(add);

		function add() {
			return a + untrack(() => b);
		}

		$$renderer.push(`<button>a++</button> <button>b++</button> <p>${$.escape(a)} + ${$.escape(b)} = ${$.escape(sum())}</p>`);
	});
}