import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let {
		selectedBook = "a</option><sc" + "ript>alert(\"pwnd\")</sc" + "ript><option>puppa"
	} = $$props;

	$$renderer.push(`<select>`);
	$$renderer.option({}, selectedBook);

	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`selected: ${$.escape(selectedBook)}`);
	});

	$$renderer.push(`</select>`);
}