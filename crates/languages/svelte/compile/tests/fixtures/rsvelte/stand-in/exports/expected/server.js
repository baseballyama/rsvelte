import * as $ from "svelte/internal/server";
export const answer = 42;
export function double(n) {
	return n * 2;
}
export default function Exports($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "";
		const { $$slots, $$events, ...props } = $$props;
		$$renderer.push(`<p${$.attr("title", value)}>${$.escape(props.a)}</p>`);
	});
}
