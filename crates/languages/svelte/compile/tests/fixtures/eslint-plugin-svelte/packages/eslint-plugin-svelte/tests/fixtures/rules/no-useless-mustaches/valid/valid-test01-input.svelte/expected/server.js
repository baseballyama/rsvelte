import * as $ from 'svelte/internal/server';

export default function Valid_test01_input($$renderer) {
	let foo = 'foo';

	$$renderer.push(`<!---->foo 'foo'
foo
foo
1

foofoo
{foo <div data-text="foo 'foo' foo foo 1 "></div>`);
}