import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let content = ["a ", "b ", "c "];

	$$renderer.push(`<div>before</div> <br/> <!--[-->`);

	const each_array = $.ensure_array_like(content);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let c = each_array[$$index];

		$$renderer.push(`${$.html(c)}`);
	}

	$$renderer.push(`<!--]--> <div>after</div>`);
}