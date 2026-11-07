import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function foo(node, params) {
		return {
			duration: 100,
			tick: (t, u) => {
				node.foo = t;
			}
		};
	}

	let list = [];
	let id = 0;

	function push() {
		list.push({ id: id++ });
	}

	function remove() {
		list = [];
	}

	$$renderer.push(`<button>Push</button> <button>Remove</button> <ul><!--[-->`);

	const each_array = $.ensure_array_like(list);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<li>${$.escape(item.id)}</li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}