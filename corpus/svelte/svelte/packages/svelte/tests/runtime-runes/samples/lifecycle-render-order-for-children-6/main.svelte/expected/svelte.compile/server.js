import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function create_action() {
		let index = 0;

		return () => {
			console.log(index++);
		};
	}

	const content = create_action();

	if (true) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div></div> <!--[-->`);

	const each_array = $.ensure_array_like({ length: 5 });

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let _ = each_array[$$index];

		$$renderer.push(`<div><div></div></div>`);
	}

	$$renderer.push(`<!--]-->`);
}