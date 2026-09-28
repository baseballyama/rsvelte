import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { uid, dateToString } from "@svar-ui/lib-dom";
import Text from "../Text.svelte";
import Dropdown from "../Dropdown.svelte";
import Calendar from "../Calendar.svelte";

var root = $.from_html(`<div class="wx-datepicker svelte-18fmx2z"><!> <!></div>`);

export default function Layout($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		id = $.prop($$props, 'id', 19, uid),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		width = $.prop($$props, 'width', 3, "unset"),
		align = $.prop($$props, 'align', 3, "start"),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		format = $.prop($$props, 'format', 3, ""),
		buttons = $.prop($$props, 'buttons', 19, () => ["clear", "today"]),
		css = $.prop($$props, 'css', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		editable = $.prop($$props, 'editable', 3, false),
		clear = $.prop($$props, 'clear', 3, false);

	const { calendar: calendarLocale, formats } = getContext("wx-i18n").getRaw();
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

	function onchange({ value: v, input }) {
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

			get error() {
				return error();
			},

			get placeholder() {
				return placeholder();
			},
			oninput: oncancel,
			onchange,
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
				});
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