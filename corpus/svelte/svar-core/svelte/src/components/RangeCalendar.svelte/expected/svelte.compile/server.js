import * as $ from 'svelte/internal/server';
import { untrack } from "svelte";
import Panel from "./calendar/Panel.svelte";
import Locale from "../Locale.svelte";

export default function RangeCalendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			start = void 0,
			end = void 0,
			current,
			months = 2,
			markers = null,
			buttons = ["clear", "today"],
			css = "",
			onchange
		} = $$props;

		function addMonth(l, diff, rPrev) {
			const r = new Date(l);

			r.setMonth(r.getMonth() + diff);

			if (rPrev && r.valueOf() == rPrev.valueOf()) return rPrev;

			return r;
		}

		let leftCurrent = void 0;
		let rightCurrent = void 0;

		function onLeft(v) {
			leftCurrent = v;
			leftCurrent.setDate(1);

			if (leftCurrent) rightCurrent = addMonth(leftCurrent, 1);
		}

		function onRight(v) {
			rightCurrent = v;
			rightCurrent.setDate(1);

			if (rightCurrent) leftCurrent = addMonth(rightCurrent, -1);
		}

		function doChangeStart(v) {
			selectChange(v);

			if (start) onLeft(new Date(start));
		}

		function doChangeEnd(v) {
			selectChange(v);

			if (end) onRight(new Date(end));
		}

		function selectChange(ev) {
			const v = ev.value;
			const final = v === -1;

			if (!final) {
				if (ev.select) {
					if (!start || end) {
						start = v;
						end = null;
					} else {
						if (start > v) {
							end = start;
							start = v;
						} else {
							end = v;
						}
					}
				} else {
					if (!v) {
						start = end = null;
					} else {
						start = new Date(v);
						end = new Date(v);
					}
				}
			}

			if (final || !buttons.includes("done")) onchange && onchange({ start, end });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Locale($$renderer, {
				children: ($$renderer) => {
					if (months == 1) {
						$$renderer.push('<!--[0-->');

						Panel($$renderer, {
							value: { start, end },
							markers,
							buttons,
							css,
							part: 'both',
							onchange: doChangeStart,
							get current() {
								return leftCurrent;
							},

							set current($$value) {
								leftCurrent = $$value;
								$$settled = false;
							}
						});
					} else {
						$$renderer.push(`<!--[-1--><div${$.attr_class(`wx-rangecalendar ${$.stringify(css)}`, 'svelte-lgxeuh')}><div class="wx-half svelte-lgxeuh">`);

						Panel($$renderer, {
							value: { start, end },
							markers,
							buttons: false,
							part: 'left',
							onshift: () => onLeft(leftCurrent),
							onchange: doChangeStart,
							get current() {
								return leftCurrent;
							},

							set current($$value) {
								leftCurrent = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div> <div class="wx-half svelte-lgxeuh">`);

						Panel($$renderer, {
							value: { start, end },
							markers,
							buttons,
							part: 'right',
							onshift: () => onRight(rightCurrent),
							onchange: doChangeEnd,
							get current() {
								return rightCurrent;
							},

							set current($$value) {
								rightCurrent = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { start, end });
	});
}