import * as $ from 'svelte/internal/server';

export default function While($$renderer) {
	const value = "a";
	function run(x) {
		while (x > 2) x--;
		do {
			x++;
		} while (x < 2);
		return x;
	}
	$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-1iiwl1o')}></p>`);
}
