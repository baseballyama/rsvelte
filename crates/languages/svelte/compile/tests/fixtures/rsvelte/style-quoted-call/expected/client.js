import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<div></div> <div></div> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!>`, 1);
export default function Style_quoted_call($$anchor, $$props) {
	$.push($$props, true);
	let n = 1;
	var fragment = root_1();
	var div = $.first_child(fragment);
	let styles;
	var div_1 = $.sibling(div, 2);
	$.attribute_effect(div_1, ($0) => ({
		...$$props.items,
		[$.STYLE]: { left: $0 }
	}), [() => `${$$props.f($$props.x) ?? ""}px`]);
	var node = $.sibling(div_1, 2);
	{
		let $0 = $.derived(() => $$props.f(n));
		$.css_props(node, () => ({ "--a": `${$.get($0) ?? ""}px` }));
		Comp(node.lastChild, {});
		$.reset(node);
	}
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 17, () => $$props.items, (item) => item.key, ($$anchor, item) => {
		var span = root();
		let styles_1;
		var text = $.only_child(span, true);
		$.template_effect(($0) => {
			styles_1 = $.set_style(span, "", styles_1, { left: $0 });
			$.set_text(text, $.get(item).k);
		}, [() => `${$$props.f($.get(item).x) ?? ""}px`]);
		$.append($$anchor, span);
	});
	$.template_effect(($0, $1, $2) => styles = $.set_style(div, "", styles, {
		left: $0,
		top: "1px",
		width: $1,
		color: "red",
		transform: $2
	}), [
		() => `${$$props.f($$props.x) + n}px`,
		() => $$props.f(n),
		() => `translate(${$$props.f(1) ?? ""}, 1)`
	]);
	$.append($$anchor, fragment);
	$.pop();
}
