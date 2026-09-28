import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const array = [1, 2, 3];
	const sum = $.derived(() => array.reduce((a, b) => a + b, 0));

	$$renderer.push(`<button>${$.escape(array.join(' + '))} = ${$.escape(sum())}</button> <button>clear</button> <button>reverse</button> <!--[-->`);

	const each_array = $.ensure_array_like(array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let n = each_array[$$index];

		$$renderer.push(`<span>${$.escape(n)}</span>`);
	}

	$$renderer.push(`<!--]--> <strong>array[1]: ${$.escape(array[1])}</strong>`);
}