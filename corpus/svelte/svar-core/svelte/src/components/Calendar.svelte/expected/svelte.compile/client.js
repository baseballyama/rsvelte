import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Panel from "./calendar/Panel.svelte";
import Locale from "../Locale.svelte";

export default function Calendar($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		current = $.prop($$props, 'current', 15),
		markers = $.prop($$props, 'markers', 3, null),
		buttons = $.prop($$props, 'buttons', 19, () => ["clear", "today"]),
		css = $.prop($$props, 'css', 3, "");

	function fixCurrent(force) {
		if (!current() || force) current(value() ? new Date(value()) : new Date());

		current().setDate(1);
	}

	fixCurrent(value());

	function change(v) {
		const x = v.value;

		if (x) {
			value(new Date(x));
			fixCurrent(true);
		} else {
			value(null);
		}

		$$props.onchange && $$props.onchange({ value: value() });
	}

	Locale($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Panel($$anchor, {
				get value() {
					return value();
				},

				get markers() {
					return markers();
				},

				get buttons() {
					return buttons();
				},

				get css() {
					return css();
				},
				onchange: change,
				get current() {
					return current();
				},

				set current($$value) {
					current($$value);
				}
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}