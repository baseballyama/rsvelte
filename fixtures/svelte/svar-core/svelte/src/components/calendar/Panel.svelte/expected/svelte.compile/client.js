import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import Header from "./Header.svelte";
import Button from "./Button.svelte";
import { configs } from "./helpers";

var root = $.from_html(`<div class="wx-button-item svelte-4c5n4z"><!></div>`);
var root_1 = $.from_html(`<div class="wx-buttons svelte-4c5n4z"></div>`);
var root_2 = $.from_html(`<div><div class="wx-wrap svelte-4c5n4z"><!> <div><!> <!></div></div></div>`);

export default function Panel($$anchor, $$props) {
	$.push($$props, true);

	const _ = getContext("wx-i18n").getGroup("calendar");

	let current = $.prop($$props, 'current', 15),
		part = $.prop($$props, 'part', 3, "normal"),
		markers = $.prop($$props, 'markers', 3, null),
		buttons = $.prop($$props, 'buttons', 19, () => ["clear", "today"]),
		css = $.prop($$props, 'css', 3, "");

	let type = $.state("month");

	let buttonList = $.derived(() => {
		if (Array.isArray(buttons())) return buttons();

		return buttons() ? ["clear", "today"] : [];
	});

	function selectDate(ev, date) {
		ev.preventDefault();
		$$props.onchange && $$props.onchange({ value: date });
	}

	function oncancel() {
		if ($.get(type) === "duodecade") $.set(type, "year"); else if ($.get(type) === "year") $.set(type, "month");
	}

	function onshift(ev) {
		const { diff } = ev;

		if (diff === 0) {
			if ($.get(type) === "month") $.set(type, "year"); else if ($.get(type) === "year") $.set(type, "duodecade");

			return;
		}

		if (diff) {
			const obj = configs[$.get(type)];

			current(diff > 0 ? obj.next(current()) : obj.prev(current()));
		}

		$$props.onshift && $$props.onshift();
	}

	function onchange(value) {
		$.set(type, "month");
		$$props.onchange && $$props.onchange({ select: true, value });
	}

	function getButtonValue(btn) {
		if (btn === "done") return -1;
		if (btn === "clear") return null;
		if (btn === "today") return new Date();
	}

	const SvelteComponent = $.derived(() => configs[$.get(type)].component);
	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Header(node, {
		get date() {
			return current();
		},

		get part() {
			return part();
		},

		get type() {
			return $.get(type);
		},
		onshift
	});

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	$.component(node_1, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_1) => {
		SvelteComponent_1($$anchor, {
			get value() {
				return $$props.value;
			},

			get part() {
				return part();
			},

			get markers() {
				return markers();
			},
			onchange,
			oncancel,
			onshift,
			get current() {
				return current();
			},

			set current($$value) {
				current($$value);
			}
		});
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root_1();

			$.each(div_3, 21, () => $.get(buttonList), $.index, ($$anchor, btn) => {
				var div_4 = root();
				var node_3 = $.child(div_4);

				Button(node_3, {
					onclick: (e) => selectDate(e, getButtonValue($.get(btn))),
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(($0) => $.set_text(text, $0), [() => _($.get(btn))]);
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(div_4);
				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_2, ($$render) => {
			if ($.get(type) === "month" && $.get(buttonList).length > 0) $$render(consequent);
		});
	}

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `wx-calendar ${part() !== 'normal' && part() !== 'both' ? 'wx-part' : ''} ${css() ?? ''}`, 'svelte-4c5n4z'));
	$.append($$anchor, div);
	$.pop();
}