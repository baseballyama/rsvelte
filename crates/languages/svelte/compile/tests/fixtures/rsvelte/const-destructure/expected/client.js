import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Const_destructure($$anchor, $$props) {
	let fallback = "n/a";
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.each(node, 17, () => $$props.items, $.index, ($$anchor, item) => {
		const computed_const = $.derived(() => {
			return $.get(item).size;
		});
		const computed_const_1 = $.derived(() => {
			const [first, second = fallback] = $.get(item).tags;
			return {
				first,
				second
			};
		});
		const computed_const_2 = $.derived(() => {
			const { label: title, ...extra } = $.get(item);
			return {
				title,
				extra
			};
		});
		var p = root();
		var text = $.only_child(p);
		$.template_effect(() => $.set_text(text, `${$.get(computed_const).width ?? ""}x${$.get(computed_const).height ?? ""} ${$.get(computed_const_1).first ?? ""} ${$.get(computed_const_1).second ?? ""} ${$.get(computed_const_2).title ?? ""} ${$.get(computed_const_2).extra.note ?? ""}`));
		$.append($$anchor, p);
	});
	$.append($$anchor, fragment);
}
