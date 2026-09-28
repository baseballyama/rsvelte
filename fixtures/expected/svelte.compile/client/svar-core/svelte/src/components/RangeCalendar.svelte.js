import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from "svelte";
import Panel from "./calendar/Panel.svelte";
import Locale from "../Locale.svelte";

var root = $.from_html(`<div><div class="wx-half svelte-lgxeuh"><!></div> <div class="wx-half svelte-lgxeuh"><!></div></div>`);

export default function RangeCalendar($$anchor, $$props) {
	$.push($$props, true);

	let start = $.prop($$props, 'start', 15),
		end = $.prop($$props, 'end', 15),
		months = $.prop($$props, 'months', 3, 2),
		markers = $.prop($$props, 'markers', 3, null),
		buttons = $.prop($$props, 'buttons', 19, () => ["clear", "today"]),
		css = $.prop($$props, 'css', 3, "");

	function addMonth(l, diff, rPrev) {
		const r = new Date(l);

		r.setMonth(r.getMonth() + diff);

		if (rPrev && r.valueOf() == rPrev.valueOf()) return rPrev;

		return r;
	}

	let leftCurrent = $.state(void 0);
	let rightCurrent = $.state(void 0);

	$.user_pre_effect(() => {
		start();
		$$props.current;

		untrack(() => {
			if (!$.get(leftCurrent)) {
				onLeft(start() ? new Date(start()) : $$props.current || new Date());
			}
		});
	});

	function onLeft(v) {
		$.set(leftCurrent, v, true);
		$.get(leftCurrent).setDate(1);

		if ($.get(leftCurrent)) $.set(rightCurrent, addMonth($.get(leftCurrent), 1), true);
	}

	function onRight(v) {
		$.set(rightCurrent, v, true);
		$.get(rightCurrent).setDate(1);

		if ($.get(rightCurrent)) $.set(leftCurrent, addMonth($.get(rightCurrent), -1), true);
	}

	function doChangeStart(v) {
		selectChange(v);

		if (start()) onLeft(new Date(start()));
	}

	function doChangeEnd(v) {
		selectChange(v);

		if (end()) onRight(new Date(end()));
	}

	function selectChange(ev) {
		const v = ev.value;
		const final = v === -1;

		if (!final) {
			if (ev.select) {
				if (!start() || end()) {
					start(v);
					end(null);
				} else {
					if (start() > v) {
						end(start());
						start(v);
					} else {
						end(v);
					}
				}
			} else {
				if (!v) {
					start(end(null));
				} else {
					start(new Date(v));
					end(new Date(v));
				}
			}
		}

		if (final || !buttons().includes("done")) $$props.onchange && $$props.onchange({ start: start(), end: end() });
	}

	Locale($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => ({ start: start(), end: end() }));

						Panel($$anchor, {
							get value() {
								return $.get($0);
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
							part: 'both',
							onchange: doChangeStart,
							get current() {
								return $.get(leftCurrent);
							},

							set current($$value) {
								$.set(leftCurrent, $$value, true);
							}
						});
					}
				};

				var alternate = ($$anchor) => {
					var div = root();
					var div_1 = $.child(div);
					var node_1 = $.child(div_1);

					{
						let $0 = $.derived(() => ({ start: start(), end: end() }));

						Panel(node_1, {
							get value() {
								return $.get($0);
							},

							get markers() {
								return markers();
							},
							buttons: false,
							part: 'left',
							onshift: () => onLeft($.get(leftCurrent)),
							onchange: doChangeStart,
							get current() {
								return $.get(leftCurrent);
							},

							set current($$value) {
								$.set(leftCurrent, $$value, true);
							}
						});
					}

					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_2 = $.child(div_2);

					{
						let $0 = $.derived(() => ({ start: start(), end: end() }));

						Panel(node_2, {
							get value() {
								return $.get($0);
							},

							get markers() {
								return markers();
							},

							get buttons() {
								return buttons();
							},
							part: 'right',
							onshift: () => onRight($.get(rightCurrent)),
							onchange: doChangeEnd,
							get current() {
								return $.get(rightCurrent);
							},

							set current($$value) {
								$.set(rightCurrent, $$value, true);
							}
						});
					}

					$.reset(div_2);
					$.reset(div);
					$.template_effect(() => $.set_class(div, 1, `wx-rangecalendar ${css() ?? ''}`, 'svelte-lgxeuh'));
					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if (months() == 1) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}