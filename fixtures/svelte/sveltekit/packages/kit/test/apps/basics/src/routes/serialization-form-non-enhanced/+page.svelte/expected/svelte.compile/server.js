import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { form } = $$props;

		$$renderer.push(`<form method="POST"><button type="submit">submit</button></form> <h1>${$.escape(form?.foo?.bar())}</h1> <a href="/serialization-basic">To basic form</a>`);
	});
}