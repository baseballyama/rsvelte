import * as $ from "svelte/internal/server";
export default function Slots_object($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);
	let { title, $$slots: $$slots_, $$events, ...rest } = $$props;
	const named = $$slots.header ? "with" : "without";
	if ($$slots.header) {
		$$renderer.push(`<!--[0--><header><!--[-->`);
		$.slot($$renderer, $$props, "header", {}, null);
		$$renderer.push(`<!--]--></header>`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--> <h1${$.attributes({ ...rest })}>${$.escape(title)} ${$.escape(named)}</h1> <!--[-->`);
	$.slot($$renderer, $$props, "default", {}, null);
	$$renderer.push(`<!--]-->`);
}
