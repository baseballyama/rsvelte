import * as $ from "svelte/internal/server";
export default function Declaration_tag_destructured_state($$renderer) {
	let tmp = [1], $$array = $.to_array(tmp, 1), a = $$array[0], b = 2, $$d = $.derived(() => ({ c: a + b })), c = $.derived(() => $$d().c);
	$$renderer.push(`<p>${$.escape(a)}${$.escape(b)}${$.escape(c())}</p> <button>x</button>`);
}
