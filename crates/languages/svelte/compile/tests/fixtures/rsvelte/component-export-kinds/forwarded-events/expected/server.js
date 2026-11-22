import * as $ from "svelte/internal/server";
export default function Forwarded_events($$renderer, $$props) {
	let { a } = $$props;
	$$renderer.push(`<button>${$.escape(a)}</button>`);
}
