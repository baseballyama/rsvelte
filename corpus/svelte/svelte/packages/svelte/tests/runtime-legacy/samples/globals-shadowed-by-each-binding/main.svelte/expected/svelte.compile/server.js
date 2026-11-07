import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const alerts = ['Alert1', 'Alert2'];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(alerts);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let alert = each_array[$$index];

		$$renderer.push(`<p>${$.escape(alert)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}