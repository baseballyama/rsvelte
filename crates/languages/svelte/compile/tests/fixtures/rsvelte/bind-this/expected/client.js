import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Foo from "./Foo.svelte";
var root = $.from_html(`<i></i> <u></u>`, 1);
var root_1 = $.from_html(`<div></div> <span></span> <p></p> <b></b> <!> <canvas></canvas> <!> <!> <!>`, 1);
export default function Bind_this($$anchor, $$props) {
	$.push($$props, true);
	let p = $.prop($$props, "p", 15);
	let el;
	let a = $.state(void 0);
	let refs = $.proxy([]);
	let items = $.proxy([{ el: null }]);
	const obj = { x: null };
	var fragment = root_1();
	var div = $.first_child(fragment);
	$.bind_this(div, ($$value) => el = $$value, () => el);
	var span = $.sibling(div, 2);
	$.bind_this(span, ($$value) => $.set(a, $$value), () => $.get(a));
	var p_1 = $.sibling(span, 2);
	$.bind_this(p_1, ($$value) => p($$value), () => p());
	var b = $.sibling(p_1, 2);
	$.bind_this(b, ($$value) => obj.x = $$value, () => obj?.x);
	var node = $.sibling(b, 2);
	$.each(node, 17, () => items, $.index, ($$anchor, item, i) => {
		var fragment_1 = root();
		var i_1 = $.first_child(fragment_1);
		$.bind_this(i_1, ($$value, i) => refs[i] = $$value, (i) => refs?.[i], () => [i]);
		var u = $.sibling(i_1, 2);
		$.bind_this(u, ($$value, item) => item.el = $$value, (item) => item?.el, () => [$.get(item)]);
		$.append($$anchor, fragment_1);
	});
	var canvas = $.sibling(node, 2);
	$.bind_this(canvas, (v) => el = v, () => el);
	var node_1 = $.sibling(canvas, 2);
	$.bind_this(Foo(node_1, { x: 1 }), ($$value) => $.set(a, $$value, true), () => $.get(a));
	var node_2 = $.sibling(node_1, 2);
	$.component(node_2, () => $$props.C, ($$anchor, C_1) => {
		$.bind_this(C_1($$anchor, {}), ($$value) => $.set(a, $$value, true), () => $.get(a));
	});
	var node_3 = $.sibling(node_2, 2);
	$.each(node_3, 18, () => [1, 2], (n) => n, ($$anchor, n, i) => {
		$.bind_this(Foo($$anchor, {}), ($$value, i) => refs[i] = $$value, (i) => refs?.[i], () => [$.get(i)]);
	});
	$.append($$anchor, fragment);
	$.pop();
}
