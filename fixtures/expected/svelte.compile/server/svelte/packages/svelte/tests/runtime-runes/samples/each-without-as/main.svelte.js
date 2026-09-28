import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like([10, 20]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		$$renderer.push(`<div>hi</div>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like([10, 20]);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		$$renderer.push(`<div>${$.escape(i)}</div>`);
	}

	$$renderer.push(`<!--]-->`);
}