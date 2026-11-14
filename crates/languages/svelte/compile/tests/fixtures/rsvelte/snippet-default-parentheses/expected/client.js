import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
const lit = ($$anchor, $$arg0) => {
	let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), 1));
	var span_1 = root();
	var text_1 = $.only_child(span_1, true);
	$.template_effect(() => $.set_text(text_1, $.get(p)));
	$.append($$anchor, span_1);
};
const unary = ($$anchor, $$arg0) => {
	let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => -1, true));
	var span_2 = root();
	var text_2 = $.only_child(span_2, true);
	$.template_effect(() => $.set_text(text_2, $.get(p)));
	$.append($$anchor, span_2);
};
const litp = ($$anchor, $$arg0) => {
	let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => 1, true));
	var span_8 = root();
	var text_8 = $.only_child(span_8, true);
	$.template_effect(() => $.set_text(text_8, $.get(p)));
	$.append($$anchor, span_8);
};
const arrowp = ($$anchor, $$arg0) => {
	let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => (() => 1), true));
	var span_9 = root();
	var text_9 = $.only_child(span_9, true);
	$.template_effect(() => $.set_text(text_9, $.get(p)));
	$.append($$anchor, span_9);
};
const arr = ($$anchor, $$arg0) => {
	let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => [1, (2, 3)], true));
	var span_13 = root();
	var text_13 = $.only_child(span_13, true);
	$.template_effect(() => $.set_text(text_13, $.get(p)));
	$.append($$anchor, span_13);
};
const obji = ($$anchor, $$arg0) => {
	let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => ({ k: (1, 2) }), true));
	var span_14 = root();
	var text_14 = $.only_child(span_14, true);
	$.template_effect(() => $.set_text(text_14, $.get(p)));
	$.append($$anchor, span_14);
};
var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<!><!><!><!> <!><!><!><!> <!><!><!><!> <!><!><!><!> <!><!><!><!>`, 1);
export default function Snippet_default_parentheses($$anchor, $$props) {
	$.push($$props, true);
	const bare = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a, true));
		var span = root();
		var text = $.only_child(span, true);
		$.template_effect(() => $.set_text(text, $.get(p)));
		$.append($$anchor, span);
	};
	const cond = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a ? 1 : 2, true));
		var span_3 = root();
		var text_3 = $.only_child(span_3, true);
		$.template_effect(() => $.set_text(text_3, $.get(p)));
		$.append($$anchor, span_3);
	};
	const nested = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a ? obj.a ? 1 : 2 : 3, true));
		var span_4 = root();
		var text_4 = $.only_child(span_4, true);
		$.template_effect(() => $.set_text(text_4, $.get(p)));
		$.append($$anchor, span_4);
	};
	const seq = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => (obj.a, obj.a), true));
		var span_5 = root();
		var text_5 = $.only_child(span_5, true);
		$.template_effect(() => $.set_text(text_5, $.get(p)));
		$.append($$anchor, span_5);
	};
	const one = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a, true));
		var span_6 = root();
		var text_6 = $.only_child(span_6, true);
		$.template_effect(() => $.set_text(text_6, $.get(p)));
		$.append($$anchor, span_6);
	};
	const two = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a, true));
		var span_7 = root();
		var text_7 = $.only_child(span_7, true);
		$.template_effect(() => $.set_text(text_7, $.get(p)));
		$.append($$anchor, span_7);
	};
	const condp = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => a ? 1 : 2, true));
		var span_10 = root();
		var text_10 = $.only_child(span_10, true);
		$.template_effect(() => $.set_text(text_10, $.get(p)));
		$.append($$anchor, span_10);
	};
	const logic = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => a ?? (b || c), true));
		var span_11 = root();
		var text_11 = $.only_child(span_11, true);
		$.template_effect(() => $.set_text(text_11, $.get(p)));
		$.append($$anchor, span_11);
	};
	const seq3 = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => (a, b, c), true));
		var span_12 = root();
		var text_12 = $.only_child(span_12, true);
		$.template_effect(() => $.set_text(text_12, $.get(p)));
		$.append($$anchor, span_12);
	};
	const assign = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => a = 1, true));
		var span_15 = root();
		var text_15 = $.only_child(span_15, true);
		$.template_effect(() => $.set_text(text_15, $.get(p)));
		$.append($$anchor, span_15);
	};
	const memb = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a.b, true));
		var span_16 = root();
		var text_16 = $.only_child(span_16, true);
		$.template_effect(() => $.set_text(text_16, $.get(p)));
		$.append($$anchor, span_16);
	};
	const memb2 = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a, true));
		var span_17 = root();
		var text_17 = $.only_child(span_17, true);
		$.template_effect(() => $.set_text(text_17, $.get(p)));
		$.append($$anchor, span_17);
	};
	const arrow = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), (x) => y));
		var span_18 = root();
		var text_18 = $.only_child(span_18, true);
		$.template_effect(() => $.set_text(text_18, $.get(p)));
		$.append($$anchor, span_18);
	};
	const typeo = ($$anchor, $$arg0) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => typeof a, true));
		var span_19 = root();
		var text_19 = $.only_child(span_19, true);
		$.template_effect(() => $.set_text(text_19, $.get(p)));
		$.append($$anchor, span_19);
	};
	let obj = { a: { b: 1 } };
	let a = 1;
	let b = 2;
	let c = 3;
	let x = 4;
	let y = 5;
	var fragment = root_1();
	var node = $.first_child(fragment);
	bare(node);
	var node_1 = $.sibling(node);
	lit(node_1);
	var node_2 = $.sibling(node_1);
	unary(node_2);
	var node_3 = $.sibling(node_2);
	cond(node_3);
	var node_4 = $.sibling(node_3, 2);
	nested(node_4);
	var node_5 = $.sibling(node_4);
	seq(node_5);
	var node_6 = $.sibling(node_5);
	one(node_6);
	var node_7 = $.sibling(node_6);
	two(node_7);
	var node_8 = $.sibling(node_7, 2);
	litp(node_8);
	var node_9 = $.sibling(node_8);
	arrowp(node_9);
	var node_10 = $.sibling(node_9);
	condp(node_10);
	var node_11 = $.sibling(node_10);
	logic(node_11);
	var node_12 = $.sibling(node_11, 2);
	seq3(node_12);
	var node_13 = $.sibling(node_12);
	arr(node_13);
	var node_14 = $.sibling(node_13);
	obji(node_14);
	var node_15 = $.sibling(node_14);
	assign(node_15);
	var node_16 = $.sibling(node_15, 2);
	memb(node_16);
	var node_17 = $.sibling(node_16);
	memb2(node_17);
	var node_18 = $.sibling(node_17);
	arrow(node_18);
	var node_19 = $.sibling(node_18);
	typeo(node_19);
	$.append($$anchor, fragment);
	$.pop();
}
