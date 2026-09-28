import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import Header from "./Header.svelte";
import Button from "./Button.svelte";
import { configs } from "./helpers";

export default function Panel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _ = getContext("wx-i18n").getGroup("calendar");

		let {
			value,
			current = void 0,
			part = "normal",
			markers = null,
			buttons = ["clear", "today"],
			css = "",
			onshift: shift,
			onchange: change
		} = $$props;

		let type = "month";

		let buttonList = $.derived(() => {
			if (Array.isArray(buttons)) return buttons;

			return buttons ? ["clear", "today"] : [];
		});

		function selectDate(ev, date) {
			ev.preventDefault();
			change && change({ value: date });
		}

		function oncancel() {
			if (type === "duodecade") type = "year"; else if (type === "year") type = "month";
		}

		function onshift(ev) {
			const { diff } = ev;

			if (diff === 0) {
				if (type === "month") type = "year"; else if (type === "year") type = "duodecade";

				return;
			}

			if (diff) {
				const obj = configs[type];

				current = diff > 0 ? obj.next(current) : obj.prev(current);
			}

			shift && shift();
		}

		function onchange(value) {
			type = "month";
			change && change({ select: true, value });
		}

		function getButtonValue(btn) {
			if (btn === "done") return -1;
			if (btn === "clear") return null;
			if (btn === "today") return new Date();
		}

		const SvelteComponent = $.derived(() => configs[type].component);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class(`wx-calendar ${part !== 'normal' && part !== 'both' ? 'wx-part' : ''} ${$.stringify(css)}`, 'svelte-4c5n4z')}><div class="wx-wrap svelte-4c5n4z">`);
			Header($$renderer, { date: current, part, type, onshift });
			$$renderer.push(`<!----> <div>`);

			if (SvelteComponent()) {
				$$renderer.push('<!--[-->');

				SvelteComponent()($$renderer, {
					value,
					part,
					markers,
					onchange,
					oncancel,
					onshift,
					get current() {
						return current;
					},

					set current($$value) {
						current = $$value;
						$$settled = false;
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (type === "month" && buttonList().length > 0) {
				$$renderer.push(`<!--[0--><div class="wx-buttons svelte-4c5n4z"><!--[-->`);

				const each_array = $.ensure_array_like(buttonList());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let btn = each_array[$$index];

					$$renderer.push(`<div class="wx-button-item svelte-4c5n4z">`);

					Button($$renderer, {
						onclick: (e) => selectDate(e, getButtonValue(btn)),
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(_(btn))}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { current });
	});
}