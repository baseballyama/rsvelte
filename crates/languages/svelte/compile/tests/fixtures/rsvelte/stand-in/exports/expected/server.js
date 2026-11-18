import * as $ from "svelte/internal/server";
export const answer = 42;
export function double(n) {
	return n * 2;
}
export default function Exports($$renderer) {
	let value = "";
	$$renderer.push(`<p${$.attr("title", value)}>`);
	if (value) {
		$$renderer.push("<!--[0-->");
		Exports($$renderer, {});
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--></p>`);
}
