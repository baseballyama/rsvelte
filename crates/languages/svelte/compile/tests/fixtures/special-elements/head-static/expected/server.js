import * as $ from "svelte/internal/server";
export default function Head_static($$renderer) {
	$.head("1p7qgav", $$renderer, ($$renderer) => {
		$$renderer.push(`<meta name="description" content="test"/>`);
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Hello &amp; world</title>`);
		});
	});
	$$renderer.push(`<p>Body</p>`);
}
