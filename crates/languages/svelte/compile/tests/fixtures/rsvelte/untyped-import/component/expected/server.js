import * as $ from "svelte/internal/server";
export default function Component($$renderer, $$props) {
	let { name } = $$props;
	$$renderer.push(`<p>${$.escape(name)}</p>`);
}
