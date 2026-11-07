import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like({ length: 5 });

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		$$renderer.push(`<!---->hi`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like({ length: 5 });

	for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
		$$renderer.push(`<!---->${$.escape(index)}`);
	}

	$$renderer.push(`<!--]-->`);
}