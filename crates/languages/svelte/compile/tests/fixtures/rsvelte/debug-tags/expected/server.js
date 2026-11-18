import * as $ from "svelte/internal/server";
export default function Debug_tags($$renderer) {
	let x = 1;
	let y = 2;
	let o = { a: 1 };
	console.log({
		x,
		y
	});
	debugger;
	console.log({});
	debugger;
	if (x) {
		$$renderer.push("<!--[0-->");
		console.log({ o });
		debugger;
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--> <button>${$.escape(x)}</button>`);
}
