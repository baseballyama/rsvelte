import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<textarea>`);

	const $$body = $.escape(`	<p>not actu </textar ally an element. ${$.stringify(foo)}</p>
</textare


> </textaread >asdf`);

	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}

	$$renderer.push(`</textarea>`);
}