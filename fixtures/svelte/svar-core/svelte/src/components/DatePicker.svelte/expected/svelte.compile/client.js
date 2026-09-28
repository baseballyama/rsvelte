import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { dateToString } from "@svar-ui/lib-dom";
import Text from "./Text.svelte";
import Dropdown from "./Dropdown.svelte";
import Calendar from "./Calendar.svelte";
import { defaultLocale } from "./helpers/locale";
import { toDateDropdown } from "./helpers/dropdown";

var root = $.from_html(`<div class="wx-datepicker svelte-10o1gum"><!> <!></div>`);

export default function DatePicker($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		format = $.prop($$props, 'format', 3, ""),
		buttons = $.prop($$props, 'buttons', 19, () => ["clear", "today"]),
		css = $.prop($$props, 'css', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		editable = $.prop($$props, 'editable', 3, false),
		clear = $.prop($$props, 'clear', 3, false),
		dropdown = $.prop($$props, 'dropdown', 19, () => ({}));

	const { calendar: calendarLocale, formats } = (getContext("wx-i18n") || defaultLocale()).getRaw();
	const f = format() || formats.dateFormat;
	let dateFormat = typeof f === "function" ? f : dateToString(f, calendarLocale);
	let popup = $.state(void 0);

	function oncancel() {
		$.set(popup, false);
	}

	function doChange(v) {
		// skip "select" event if the same value
		// or different objects with the same value
		const skipEvent = v === value() || v && value() && v.valueOf() === value().valueOf() || !v && !value();

		value(v);

		if (!skipEvent) {
			$$props.onchange && $$props.onchange({ value: value() });
		}

		// fire after on-click finished
		setTimeout(oncancel, 1);
	}

	const formattedValue = $.derived(() => value() ? dateFormat(value()) : "");

	function change({ value: v, input }) {
		if (!editable() && !clear()) return;
		if (input) return;

		// convert to date, but ignore empty string input
		let date = typeof editable() === "function" ? editable()(v) : v ? new Date(v) : null;

		// if date is invalid ( incorrect text input ) then use old value
		// else use the entered date
		// in any case fallback to null, to prevent undefined as value
		date = isNaN(date) ? value() || null : date || null;

		doChange(date);
	}

	var div = root();

	$.event('scroll', $.window, oncancel);

	var node = $.child(div);

	{
		let $0 = $.derived(() => `wx-date-input ${css()}`);
		let $1 = $.derived(() => !editable());

		Text(node, {
			get css() {
				return $.get($0);
			},

			get title() {
				return title();
			},

			get tooltip() {
				return $$props.tooltip;
			},

			get value() {
				return $.get(formattedValue);
			},

			get id() {
				return $$props.id;
			},

			get readonly() {
				return $.get($1);
			},

			get disabled() {
				return disabled();
			},

			get error() {
				return error();
			},

			get placeholder() {
				return placeholder();
			},
			oninput: oncancel,
			onchange: change,
			icon: 'wxi-calendar',
			get clear() {
				return clear();
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => toDateDropdown(dropdown()));

				Dropdown($$anchor, $.spread_props({ oncancel }, () => $.get($0), {
					children: ($$anchor, $$slotProps) => {
						Calendar($$anchor, {
							get buttons() {
								return buttons();
							},

							get value() {
								return value();
							},
							onchange: (e) => doChange(e.value)
						});
					},
					$$slots: { default: true }
				}));
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(popup) && !disabled()) $$render(consequent);
		});
	}

	$.reset(div);
	$.delegated('click', div, () => $.set(popup, true));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);