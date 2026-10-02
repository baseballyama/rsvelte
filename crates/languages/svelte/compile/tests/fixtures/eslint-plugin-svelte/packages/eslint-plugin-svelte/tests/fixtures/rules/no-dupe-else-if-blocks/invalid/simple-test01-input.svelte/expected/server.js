import * as $ from 'svelte/internal/server';

export default function Simple_test01_input($$renderer) {
	let foo = true;

	if (foo) {
		$$renderer.push(`<!--[0--><div>if</div>`);
	} else if (foo) {
		$$renderer.push(`<!--[1--><div>else if</div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}