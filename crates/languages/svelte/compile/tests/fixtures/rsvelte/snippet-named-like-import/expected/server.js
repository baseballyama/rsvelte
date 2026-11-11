import * as $ from "svelte/internal/server";
import a from "./a.js";
const b = 1;
export default function Snippet_named_like_import($$renderer) {
	function a($$renderer) {
		$$renderer.push(`<p>1</p>`);
	}
	function b($$renderer) {
		$$renderer.push(`<p>2</p>`);
	}
	function c($$renderer) {
		a($$renderer);
	}
	a($$renderer);
	$$renderer.push(`<!---->`);
	b($$renderer);
	$$renderer.push(`<!---->`);
	c($$renderer);
	$$renderer.push(`<!---->`);
}
