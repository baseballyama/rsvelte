import * as $ from "svelte/internal/server";
export default function Member_through_a_typescript_cast($$renderer) {
	let o = { p: 1 };
	$$renderer.push(`<p>${$.escape(globalThis.p)}</p> <p>${$.escape(o.p)}</p> <p>${$.escape(fn())}</p>`);
}
