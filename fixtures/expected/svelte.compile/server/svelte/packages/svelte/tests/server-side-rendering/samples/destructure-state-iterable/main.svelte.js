import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function* test() {
		while (true) {
			yield count++;
		}
	}

	let tmp = test(),
		$$array = $.to_array(tmp, 2),
		one = $$array[0],
		two = $$array[1];

	$$renderer.push(`<!---->${$.escape(one)}, ${$.escape(two)}`);
}