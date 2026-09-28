import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Field from "../Field.svelte";
import Text from "../Text.svelte";
import Dropdown from "../Dropdown.svelte";
import Slider from "../Slider.svelte";
import TwoState from "../TwoState.svelte";
import { getContext } from "svelte";
import { dateToString, uid } from "@svar-ui/lib-dom";

var root = $.from_html(`<span>pm</span>`);
var root_1 = $.from_html(`<span>am</span>`);
var root_2 = $.from_html(`<div class="wx-wrapper svelte-sxn4ra"><div class="wx-timer svelte-sxn4ra"><input class="wx-digit svelte-sxn4ra"/> <div class="wx-separator svelte-sxn4ra">:</div> <input class="wx-digit svelte-sxn4ra"/> <!></div> <!> <!></div>`);
var root_3 = $.from_html(`<div><!> <!></div>`);

export default function Layout($$anchor, $$props) {
	$.push($$props, true);

	const defValue = new Date(0, 0, 0, 0, 0);

	let value = $.prop($$props, 'value', 31, () => $.proxy(defValue)),
		id = $.prop($$props, 'id', 19, uid),
		title = $.prop($$props, 'title', 3, ""),
		css = $.prop($$props, 'css', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		format = $.prop($$props, 'format', 3, "");

	const { calendar: calendarLocale, formats } = getContext("wx-i18n").getRaw();
	const h12 = calendarLocale.clockFormat == 12;
	const maxH = 23;
	const maxM = 59;

	const update = (v, max) => {
		v = getNumber(v);

		return Math.min(v, max);
	};

	let popup = $.state(void 0);
	const safeValue = $.derived(() => value() || defValue);
	let h = $.derived(() => update($.get(safeValue).getHours(), maxH));
	let m = $.derived(() => update($.get(safeValue).getMinutes(), maxM));
	const pm = $.derived(() => $.get(h) > 12);
	const hText = $.derived(() => formatH($.get(h)));
	const mText = $.derived(() => formatM($.get(m)));
	const textValue = $.derived(() => $.get(timeFormat)(new Date(0, 0, 0, $.get(h), $.get(m))));

	function click() {
		$.set(popup, true);
	}

	function togglePM() {
		const next = new Date($.get(safeValue));

		next.setHours(next.getHours() + ($.get(pm) ? -12 : 12));
		value(next);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function setHours({ value: v }) {
		if ($.get(safeValue).getHours() === v) return;

		const next = new Date($.get(safeValue));

		next.setHours(v);
		value(next);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function setMinutes({ value: v }) {
		if ($.get(safeValue).getMinutes() === v) return;

		const next = new Date($.get(safeValue));

		next.setMinutes(v);
		value(next);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function formatH(v) {
		if (h12) {
			v = v % 12;

			if (v === 0) return "12";
		}

		return formatTime(v, $.get(zeroBased));
	}

	function formatM(v) {
		return formatTime(v, true);
	}

	function updateH(v) {
		v = update(v, maxH);

		if (h12) {
			v = v * 1;

			if (v === 12) v = 0;
			if ($.get(pm)) v += 12;
		}

		return v;
	}

	function getNumber(v) {
		return `${v}`.replace(/[^\d]/g, "") || 0;
	}

	function formatTime(v, zeroBased) {
		return (v < 10 && zeroBased ? `0${v}` : `${v}`).slice(-2);
	}

	function oncancel() {
		$.set(popup, null);
	}

	const timeFormat = $.derived(() => {
		const f = format() || formats.timeFormat;

		return typeof f === "function" ? f : dateToString(f, calendarLocale);
	});

	const zeroBased = $.derived(() => $.get(timeFormat)(new Date(0, 0, 0, 1)).indexOf("01") != -1);
	var div = root_3();
	let classes;
	var node = $.child(div);

	Text(node, {
		get id() {
			return id();
		},

		get css() {
			return css();
		},

		get title() {
			return title();
		},

		get value() {
			return $.get(textValue);
		},
		readonly: true,
		get disabled() {
			return disabled();
		},

		get error() {
			return error();
		},
		icon: 'wxi-clock',
		inputStyle: 'cursor: pointer; width: 100%; padding-right: calc(var(--wx-input-icon-size) + var(--wx-input-icon-indent) * 2);'
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Dropdown($$anchor, {
				oncancel,
				width: "unset",
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_2();
					var div_2 = $.child(div_1);
					var input = $.child(div_2);

					$.remove_input_defaults(input);

					var input_1 = $.sibling(input, 4);

					$.remove_input_defaults(input_1);

					var node_2 = $.sibling(input_1, 2);

					{
						var consequent = ($$anchor) => {
							{
								const active = ($$anchor) => {
									var span = root();

									$.append($$anchor, span);
								};

								TwoState($$anchor, {
									get value() {
										return $.get(pm);
									},
									onclick: togglePM,
									active,
									children: ($$anchor, $$slotProps) => {
										var span_1 = root_1();

										$.append($$anchor, span_1);
									},
									$$slots: { active: true, default: true }
								});
							}
						};

						$.if(node_2, ($$render) => {
							if (h12) $$render(consequent);
						});
					}

					$.reset(div_2);

					var node_3 = $.sibling(div_2, 2);

					Field(node_3, {
						width: "unset",
						children: ($$anchor, $$slotProps) => {
							Slider($$anchor, {
								get label() {
									return calendarLocale.hours;
								},
								width: "unset",
								get value() {
									return $.get(h);
								},
								onchange: setHours,
								max: maxH
							});
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Field(node_4, {
						width: "unset",
						children: ($$anchor, $$slotProps) => {
							Slider($$anchor, {
								get label() {
									return calendarLocale.minutes;
								},
								width: "unset",
								get value() {
									return $.get(m);
								},
								onchange: setMinutes,
								max: maxM
							});
						},
						$$slots: { default: true }
					});

					$.reset(div_1);

					$.template_effect(() => {
						$.set_value(input, $.get(hText));
						$.set_value(input_1, $.get(mText));
					});

					$.event('blur', input, function () {
						setHours({ value: updateH(this.value) });
					});

					$.event('blur', input_1, function () {
						setMinutes({ value: update(this.value, maxM) });
					});

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(popup) && !disabled()) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.template_effect(() => classes = $.set_class(div, 1, 'wx-timepicker svelte-sxn4ra', null, classes, { 'wx-error': error(), 'wx-disabled': disabled() }));
	$.delegated('click', div, click);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);