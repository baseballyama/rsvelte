import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let method = 'method';

	function submitPay() {
		console.log(method);
	}

	let methods = [{ method: 1 }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(methods);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { method } = each_array[$$index];

		$$renderer.push(`<button>${$.escape(method)}</button>`);
	}

	$$renderer.push(`<!--]-->`);
}