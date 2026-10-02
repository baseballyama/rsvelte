import * as $ from 'svelte/internal/server';

export default function String01_input($$renderer) {
	let a = 'hello!';

	$$renderer.push(`<!---->hello! <input class="hello! a"/> <input${$.attr_class('', void 0, { 'foo': { a } })}/>`);
}