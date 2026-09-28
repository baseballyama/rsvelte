import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { defaultLocale } from "./helpers/locale";

var root = $.from_html(`<div><div class="wx-left svelte-a9l91d"><span> </span> <input type="number" min="1" class="svelte-a9l91d"/></div> <div class="wx-center svelte-a9l91d"><i></i>  <i></i> <input type="text" class="svelte-a9l91d"/>  <i></i>  <i></i></div> <div class="wx-right svelte-a9l91d"> </div></div>`);

export default function Pager($$anchor, $$props) {
	$.push($$props, true);

	let total = $.prop($$props, 'total', 3, 0),
		pageSize = $.prop($$props, 'pageSize', 15, 20),
		value = $.prop($$props, 'value', 15, 1),
		css = $.prop($$props, 'css', 3, "");

	const _ = (getContext("wx-i18n") || defaultLocale()).getGroup("core");
	const pageCount = $.derived(() => Math.ceil(total() / pageSize()));
	const from = $.derived(() => (value() - 1) * pageSize());
	const to = $.derived(() => Math.min(value() * pageSize(), total()));

	const setValue = (v) => {
		value(v);

		setTimeout(() => {
			$$props.onchange && $$props.onchange({ value: value(), from: $.get(from), to: $.get(to) });
		});
	};

	function setActivePage(id) {
		switch (id) {
			case "first":
				setValue(1);
				break;

			case "prev":
				setValue(value() - 1);
				break;

			case "next":
				setValue(value() + 1);
				break;

			case "last":
				setValue($.get(pageCount));
				break;
		}
	}

	const oninput = (e) => {
		const newValue = +e.target.value;

		if (Number.isNaN(newValue) || newValue < 1 || newValue > $.get(pageCount)) {
			return;
		}

		setValue(newValue);
	};

	const onPageSizeInput = (e) => {
		$$props.onchange && $$props.onchange({ value: +e.target.value, from: $.get(from), to: $.get(to) });
	};

	var div = root();
	var div_1 = $.child(div);
	var span = $.child(div_1);
	var text = $.only_child(span);
	var input = $.sibling(span, 2);

	$.remove_input_defaults(input);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var i = $.child(div_2);
	let classes;
	var i_1 = $.sibling(i, 2);
	let classes_1;
	var input_1 = $.sibling(i_1, 2);

	$.remove_input_defaults(input_1);

	var i_2 = $.sibling(input_1, 2);
	let classes_2;
	var i_3 = $.sibling(i_2, 2);
	let classes_3;

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var text_1 = $.only_child(div_3);

	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_class(div, 1, `wx-pager ${css() ?? ''}`, 'svelte-a9l91d');
			$.set_text(text, `${$0 ?? ''}:`);
			classes = $.set_class(i, 1, 'wx-icon wxi-angle-dbl-left svelte-a9l91d', null, classes, { 'wx-disabled': value() === 1 });
			classes_1 = $.set_class(i_1, 1, 'wx-icon wxi-angle-left svelte-a9l91d', null, classes_1, { 'wx-disabled': value() === 1 });
			$.set_value(input_1, value());
			classes_2 = $.set_class(i_2, 1, 'wx-icon wxi-angle-right svelte-a9l91d', null, classes_2, { 'wx-disabled': value() === $.get(pageCount) });
			classes_3 = $.set_class(i_3, 1, 'wx-icon wxi-angle-dbl-right svelte-a9l91d', null, classes_3, { 'wx-disabled': value() === $.get(pageCount) });
			$.set_text(text_1, `${$1 ?? ''}: ${$.get(pageCount) ?? ''}`);
		},
		[() => _("Rows per page"), () => _("Total pages")]
	);

	$.delegated('input', input, onPageSizeInput);
	$.bind_value(input, pageSize);
	$.delegated('click', i, () => value() > 1 && setActivePage("first"));
	$.delegated('click', i_1, () => setActivePage("prev"));
	$.delegated('input', input_1, oninput);
	$.delegated('click', i_2, () => setActivePage("next"));
	$.delegated('click', i_3, () => setActivePage("last"));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input', 'click']);