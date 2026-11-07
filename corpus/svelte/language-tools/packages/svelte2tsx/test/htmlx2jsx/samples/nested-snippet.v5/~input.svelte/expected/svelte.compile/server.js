import * as $ from 'svelte/internal/server';

function snippetBlock($$renderer) {
	function foo($$renderer) {}
	function foo2($$renderer) {}

	foo($$renderer);
}

export default function Input($$renderer) {
	function foo($$renderer) {}

	if (true) {
		$$renderer.push('<!--[0-->');

		function foo($$renderer) {}

		foo($$renderer);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like(arr);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		function foo($$renderer) {}

		foo($$renderer);
	}

	$$renderer.push(`<!--]--> <!---->`);

	{
		function foo($$renderer) {}

		foo($$renderer);
	}

	$$renderer.push(`<!----> `);

	$.await($$renderer, Promise.resolve(), () => {}, (bar) => {
		function foo($$renderer) {}

		foo($$renderer);
	});

	$$renderer.push(`<!--]--> <div>`);
	foo($$renderer);
	$$renderer.push(`<!----></div> `);

	{
		function foo($$renderer) {}

		Component($$renderer, {
			foo,
			children: ($$renderer) => {
				foo($$renderer);
			},
			$$slots: { foo: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}