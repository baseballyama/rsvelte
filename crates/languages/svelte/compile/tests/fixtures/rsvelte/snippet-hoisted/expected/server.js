import * as $ from "svelte/internal/server";
import Icon from "./Icon.svelte";
function plain($$renderer) {
	Icon($$renderer, {});
	$$renderer.push(`<!---->hi`);
}
function calls_plain($$renderer) {
	plain($$renderer);
}
const greeting = "hi";
export default function Snippet_hoisted($$renderer, $$props) {
	let { name } = $$props;
	function uses_prop($$renderer) {
		$$renderer.push(`<b>${$.escape(name)}</b>`);
	}
	plain($$renderer);
	$$renderer.push(`<!----> <p>`);
	uses_prop($$renderer);
	$$renderer.push(`<!----></p> `);
	calls_plain($$renderer);
	$$renderer.push(`<!---->`);
}
