import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { uid, dateToString } from "@svar-ui/lib-dom";
import Text from "../Text.svelte";
import Dropdown from "../Dropdown.svelte";
import RangeCalendar from "../RangeCalendar.svelte";

var root = $.from_html(`<div><!> <!></div>`);

export default function Layout($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		id = $.prop($$props, 'id', 19, uid),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		width = $.prop($$props, 'width', 3, "unset"),
		align = $.prop($$props, 'align', 3, "start"),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		css = $.prop($$props, 'css', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		format = $.prop($$props, 'format', 3, ""),
		months = $.prop($$props, 'months', 3, 2),
		buttons = $.prop($$props, 'buttons', 19, () => ["clear", "today"]),
		editable = $.prop($$props, 'editable', 3, false),
		clear = $.prop($$props, 'clear', 3, false);

	const { calendar: calendarLocale, formats } = getContext("wx-i18n").getRaw();
	const f = format() || formats?.dateFormat;
	let dateFormat = typeof f === "function" ? f : dateToString(f, calendarLocale);
	let popup = $.state(void 0);

	function oncancel() {
		$.set(popup, false);
	}

	let formattedValue = $.derived(() => value()
		? value().start
			? dateFormat(value().start) + (value().end ? ` - ${dateFormat(value().end)}` : "")
			: dateFormat(value())
		: "");

	function doChange(d) {
		value(d.start || d.end ? { start: d.start, end: d.end } : null);

		// fire after on-click finished
		if (d.start && d.end || !d.start && !d.end) {
			// FIXME - select event will trigger even if the same value
			$$props.onchange && $$props.onchange({ value: value() });

			setTimeout(oncancel, 1);
		}
	}

	function doInputChange(ev) {
		if (!editable() && !clear()) return;

		const { value: v, input } = ev;

		if (input) return;

		const [s, e] = v.split(" -").map((a, i) => {
			const av = a.trim();
			let date = typeof editable() === "function" ? editable()(av) : av ? new Date(av) : null;

			// if date is invalid ( incorrect text input ) then use old value
			// else use the entered date
			// in any case fallback to null, to prevent undefined as value
			let value = i === 0 ? $.get(start) : $.get(end);

			return isNaN(date) ? value ? value : null : date || null;
		});

		doChange({ start: s, end: e });
	}

	const start = $.derived(() => value() ? value().start || null : null);
	const end = $.derived(() => value() ? value().end || null : null);
	var div = root();

	$.event('scroll', $.window, oncancel);

	let classes;
	var node = $.child(div);

	{
		let $0 = $.derived(() => !editable());

		Text(node, {
			get css() {
				return css();
			},

			get title() {
				return title();
			},

			get value() {
				return $.get(formattedValue);
			},

			get id() {
				return id();
			},

			get readonly() {
				return $.get($0);
			},

			get disabled() {
				return disabled();
			},

			get placeholder() {
				return placeholder();
			},

			get error() {
				return error();
			},
			onchange: doInputChange,
			icon: 'wxi-calendar',
			inputStyle: 'cursor: pointer; width: 100%; padding-right: calc(var(--wx-input-icon-size) + var(--wx-input-icon-indent) * 2);',
			get clear() {
				return clear();
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => !!align());

				Dropdown($$anchor, {
					oncancel,
					get width() {
						return width();
					},

					get align() {
						return align();
					},

					get autoFit() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						RangeCalendar($$anchor, {
							oncancel,
							get buttons() {
								return buttons();
							},

							get start() {
								return $.get(start);
							},

							get end() {
								return $.get(end);
							},

							get months() {
								return months();
							},
							onchange: doChange
						});
					},
					$$slots: { default: true }
				});
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(popup) && !disabled()) $$render(consequent);
		});
	}

	$.reset(div);
	$.template_effect(() => classes = $.set_class(div, 1, 'wx-daterangepicker svelte-1pj8s4q', null, classes, { 'wx-disabled': disabled(), 'wx-error': error() }));
	$.delegated('click', div, () => $.set(popup, true));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);