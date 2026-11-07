import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dateToString, getDuodecade } from "@svar-ui/lib-dom";
import { getContext } from "svelte";

var root = $.from_html(`<i class="wx-pager wxi-angle-left svelte-e82y9a"></i>`);
var root_1 = $.from_html(`<span class="wx-spacer svelte-e82y9a"></span>`);
var root_2 = $.from_html(`<i class="wx-pager wxi-angle-right svelte-e82y9a"></i>`);
var root_3 = $.from_html(`<div class="wx-header svelte-e82y9a"><!>  <span class="wx-label svelte-e82y9a"> </span> <!></div>`);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const { calendar, formats } = getContext("wx-i18n").getRaw();
	const year = $.derived(() => $$props.date.getFullYear());

	const label = $.derived(() => {
		switch ($$props.type) {
			case "month":
				return dateToString(formats.monthYearFormat, calendar)($$props.date);

			case "year":
				return dateToString(formats.yearFormat, calendar)($$props.date);

			case "duodecade":
				{
					const { start, end } = getDuodecade($.get(year));
					const yearFormat = dateToString(formats.yearFormat, calendar);

					return `${yearFormat(new Date(start, 0, 1))} - ${yearFormat(new Date(end, 11, 31))}`;
				}
		}
	});

	function changeType() {
		$$props.onshift && $$props.onshift({ diff: 0, type: $$props.type });
	}

	var div = root_3();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var i = root();

			$.delegated('click', i, () => $$props.onshift && $$props.onshift({ diff: -1, type: $$props.type }));
			$.append($$anchor, i);
		};

		var alternate = ($$anchor) => {
			var span = root_1();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.part != "right") $$render(consequent); else $$render(alternate, -1);
		});
	}

	var span_1 = $.sibling(node, 2);
	var text = $.only_child(span_1, true);
	var node_1 = $.sibling(span_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var i_1 = root_2();

			$.delegated('click', i_1, () => $$props.onshift && $$props.onshift({ diff: 1, type: $$props.type }));
			$.append($$anchor, i_1);
		};

		var alternate_1 = ($$anchor) => {
			var span_2 = root_1();

			$.append($$anchor, span_2);
		};

		$.if(node_1, ($$render) => {
			if ($$props.part != "left") $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(label)));
	$.delegated('click', span_1, changeType);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);