import * as $ from 'svelte/internal/server';

export default function Function01_input($$renderer) {
	let a = 'hello!';

	$$renderer.push(`<!---->${$.escape(() => a)}
${$.escape(function () {
		return a;
	})} <input${$.attr_class(`${$.stringify(() => a)} a`)}/>`);
}