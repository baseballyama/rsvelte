import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function createArray(initial) {
		let array = initial;

		return {
			get value() {
				return array;
			},

			push(entry) {
				array.push(entry);
				array = array.slice();
			},

			pop() {
				array.pop();
				array = array.slice();
			}
		};
	}

	const array = createArray(['x']);

	$$renderer.push(`<button>Add entry</button> <!--[-->`);

	const each_array = $.ensure_array_like(array.value);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let entry = each_array[$$index];

		$$renderer.push(`<p>${$.escape(entry)}</p>`);
	}

	$$renderer.push(`<!--]--> `);

	if (array.value.length > 1) {
		$$renderer.push(`<!--[0--><button>Remove entry</button>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}