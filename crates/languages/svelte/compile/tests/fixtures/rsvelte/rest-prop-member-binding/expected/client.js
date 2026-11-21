import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"p"
]);
var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<input type="checkbox"/> <input type="checkbox"/> <input/> <input/> <input/> <input/> <div></div> <div></div> <!> <button> </button>`, 1);
export default function Rest_prop_member_binding($$anchor, $$props) {
	$.push($$props, true);
	const binding_group = [];
	let rest = $.rest_props($$props, rest_excludes);
	let obj = $.proxy({});
	let k = "x";
	let arr = [];
	let s = $.state(0);
	let t;
	function f() {
		rest.w = 1;
		rest.u++;
		let y = $$props.r;
		[$$props.d] = arr;
		({e: $$props.e} = obj);
		$$props.a.b = 2;
		((arr) => {
			var $$array_1 = $.to_array(arr, 2);
			rest.d2 = $$array_1[0];
			$.set(s, $$array_1[1], true);
		})(arr);
		rest.e2 = obj.e, $.set(s, obj.s, true);
		(($$value) => {
			var $$array_2 = $.to_array($$value, 2);
			t = $$array_2[0];
			$.set(s, $$array_2[1], true);
		})(rest.i);
		t = rest.j;
		return $$props.q;
	}
	var fragment = root_1();
	var input = $.first_child(fragment);
	$.remove_input_defaults(input);
	var input_1 = $.sibling(input, 2);
	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = "v";
	var input_2 = $.sibling(input_1, 2);
	$.remove_input_defaults(input_2);
	var input_3 = $.sibling(input_2, 2);
	$.remove_input_defaults(input_3);
	var input_4 = $.sibling(input_3, 2);
	$.remove_input_defaults(input_4);
	var input_5 = $.sibling(input_4, 2);
	$.remove_input_defaults(input_5);
	var div = $.sibling(input_5, 2);
	$.bind_this(div, ($$value) => rest.el = $$value, () => $$props?.el);
	var div_1 = $.sibling(div, 2);
	var node = $.sibling(div_1, 2);
	$.each(node, 17, () => arr, $.index, ($$anchor, item) => {
		var input_6 = root();
		$.remove_input_defaults(input_6);
		$.bind_value(input_6, () => $$props.each, ($$value) => rest.each = $$value);
		$.append($$anchor, input_6);
	});
	var button = $.sibling(node, 2);
	var text = $.only_child(button, true);
	$.template_effect(() => $.set_text(text, $$props.t));
	$.bind_checked(input, () => $$props.c, ($$value) => rest.c = $$value);
	$.bind_group(binding_group, [], input_1, () => $$props.sel, ($$value) => rest.sel = $$value);
	$.bind_value(input_2, () => $$props.a.b, ($$value) => $$props.a.b = $$value);
	$.bind_value(input_3, () => obj[$$props.k], ($$value) => obj[$$props.k] = $$value);
	$.bind_value(input_4, () => rest[k], ($$value) => rest[k] = $$value);
	$.bind_value(input_5, () => rest.p, ($$value) => rest.p = $$value);
	$.bind_element_size(div_1, "clientWidth", ($$value) => rest.w2 = $$value);
	$.delegated("click", button, () => rest.click = 1);
	$.append($$anchor, fragment);
	$.pop();
}
$.delegate(["click"]);
