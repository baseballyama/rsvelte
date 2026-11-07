import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let tmp = [10, "Admin"],
		$$array = $.to_array(tmp, 2),
		level = $$array[0],
		custom = $$array[1];

	$$renderer.push(`<!---->${$.escape(level)}, ${$.escape(custom)}`);
}