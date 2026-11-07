import * as $ from 'svelte/internal/server';

export default function Object01_input($$renderer) {
	let a = 'hello!';

	$$renderer.push(`<!---->${$.escape({ a })} <input${$.attr_class(`${$.stringify({ a })} a`)}/>`);
}