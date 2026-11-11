import * as $ from "svelte/internal/server";
function typed($$renderer, item) {
	$$renderer.push(`<p>${$.escape(item.label)}</p>`);
}
export default function Snippet_hoisting($$renderer, $$props) {
	let { name } = $$props;
	function reaches($$renderer) {
		blocked($$renderer);
	}
	function blocked($$renderer) {
		$$renderer.push(`<p>${$.escape(name)}</p>`);
	}
	reaches($$renderer);
	$$renderer.push(`<!----> `);
	typed($$renderer, { label: "a" });
	$$renderer.push(`<!---->`);
}
