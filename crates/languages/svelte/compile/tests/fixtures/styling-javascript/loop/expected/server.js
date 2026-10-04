import * as $ from 'svelte/internal/server';

export default function Loop($$renderer) {
	const values = ["a", "b"];
	function run() {
		for (let i = 0; i < values.length; i++) {
			if (i) continue;
			console.log(values[i]);
		}
		for (const value of values) console.log(value);
		for (const key in values) console.log(key);
	}
	$$renderer.push(`<p${$.attr_class($.clsx(values[0]), 'svelte-1xg63bz')}></p>`);
}
