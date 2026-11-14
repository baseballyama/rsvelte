import * as $ from "svelte/internal/server";
export default function Bound_editable_children($$renderer) {
	let value = 1;
	let other = "x";
	function raw($$renderer) {
		$$renderer.push(`<p>${$.escape(value)} and ${$.escape(other)}</p>`);
	}
	$$renderer.push(`<div contenteditable="true">`);
	const $$body = $.escape(value);
	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {
		$$renderer.push(`${$.escape(value)}`);
	}
	$$renderer.push(`</div> <div contenteditable="">`);
	if (other) {
		$$renderer.push(`${other}`);
	} else {
		raw($$renderer);
		$$renderer.push(`<!----> <span>${$.escape(other)}</span>`);
	}
	$$renderer.push(`</div> <div contenteditable="plaintext-only">`);
	const $$body_1 = $.escape(other);
	if ($$body_1) {
		$$renderer.push(`${$$body_1}`);
	} else {
		$$renderer.push(`${$.escape(other)}`);
	}
	$$renderer.push(`</div> <p>${$.escape(value)}</p>`);
}
