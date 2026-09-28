import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let data = "<scri" + "pt>alert('pwnd')</scr" + "ipt>";

	$$renderer.push(`<div contenteditable="">`);

	const $$body = $.escape(data);

	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}

	$$renderer.push(`</div> <div contenteditable="">`);

	const $$body_1 = $.escape(data);

	if ($$body_1) {
		$$renderer.push(`${$$body_1}`);
	} else {}

	$$renderer.push(`</div> <div contenteditable="">`);

	if (data) {
		$$renderer.push(`${data}`);
	} else {}

	$$renderer.push(`</div>`);
}