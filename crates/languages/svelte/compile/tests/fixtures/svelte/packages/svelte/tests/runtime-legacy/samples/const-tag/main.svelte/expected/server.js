import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	if (true) {
		$$renderer.push('<!--[0-->');

		const bar = 'world';
		const foo = bar;
		const yoo = foo;

		$$renderer.push(`<h1>Hello worldworld!</h1>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}