import * as $ from "svelte/internal/server";
export default function Rest_exclude_literal_keys($$renderer) {
	let o = {};
	let xs = [];
	let big = $.derived(() => o[10n]), none = $.derived(() => o[null]), derived = $.derived(() => $.exclude_from_object(o, ["10", "null"]));
	let tmp = {}, half = tmp[1.5], state = $.exclude_from_object(tmp, ["1.5"]);
	let yes;
	let regex;
	let assigned;
	function assign(value) {
		({[true]: yes, [/x/g]: regex, ...assigned} = value);
	}
	$$renderer.push(`<!---->${$.escape(big())}${$.escape(none())}${$.escape(derived())}${$.escape(half)}${$.escape(state)}${$.escape(yes)}${$.escape(regex)}${$.escape(assigned)} <!--[-->`);
	const each_array = $.ensure_array_like(xs);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { 1n: one, ["s"]: s, ...item } = each_array[$$index];
		$$renderer.push(`<!---->${$.escape(one)}${$.escape(s)}${$.escape(item)}`);
	}
	$$renderer.push(`<!--]--> <button>x</button>`);
}
