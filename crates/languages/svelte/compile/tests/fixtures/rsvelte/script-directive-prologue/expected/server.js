import * as $ from "svelte/internal/server";
export default function Script_directive_prologue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		"use strict";
		let { a } = $$props;
		let b = 0;
		$$renderer.push(`<p>${$.escape(b)}</p>`);
	});
}
