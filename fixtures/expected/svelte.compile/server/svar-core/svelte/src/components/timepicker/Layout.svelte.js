import * as $ from 'svelte/internal/server';
import Field from "../Field.svelte";
import Text from "../Text.svelte";
import Dropdown from "../Dropdown.svelte";
import Slider from "../Slider.svelte";
import TwoState from "../TwoState.svelte";
import { getContext } from "svelte";
import { dateToString, uid } from "@svar-ui/lib-dom";

export default function Layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const defValue = new Date(0, 0, 0, 0, 0);

		let {
			value = defValue,
			id = uid(),
			title = "",
			css = "",
			disabled = false,
			error = false,
			format = "",
			onchange
		} = $$props;

		const { calendar: calendarLocale, formats } = getContext("wx-i18n").getRaw();
		const h12 = calendarLocale.clockFormat == 12;
		const maxH = 23;
		const maxM = 59;

		const update = (v, max) => {
			v = getNumber(v);

			return Math.min(v, max);
		};

		let popup = void 0;
		const safeValue = $.derived(() => value || defValue);
		let h = $.derived(() => update(safeValue().getHours(), maxH));
		let m = $.derived(() => update(safeValue().getMinutes(), maxM));
		const pm = $.derived(() => h() > 12);
		const hText = $.derived(() => formatH(h()));
		const mText = $.derived(() => formatM(m()));
		const textValue = $.derived(() => timeFormat()(new Date(0, 0, 0, h(), m())));

		function click() {
			popup = true;
		}

		function togglePM() {
			const next = new Date(safeValue());

			next.setHours(next.getHours() + (pm() ? -12 : 12));
			value = next;
			onchange && onchange({ value });
		}

		function setHours({ value: v }) {
			if (safeValue().getHours() === v) return;

			const next = new Date(safeValue());

			next.setHours(v);
			value = next;
			onchange && onchange({ value });
		}

		function setMinutes({ value: v }) {
			if (safeValue().getMinutes() === v) return;

			const next = new Date(safeValue());

			next.setMinutes(v);
			value = next;
			onchange && onchange({ value });
		}

		function formatH(v) {
			if (h12) {
				v = v % 12;

				if (v === 0) return "12";
			}

			return formatTime(v, zeroBased());
		}

		function formatM(v) {
			return formatTime(v, true);
		}

		function updateH(v) {
			v = update(v, maxH);

			if (h12) {
				v = v * 1;

				if (v === 12) v = 0;
				if (pm()) v += 12;
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
			popup = null;
		}

		const timeFormat = $.derived(() => {
			const f = format || formats.timeFormat;

			return typeof f === "function" ? f : dateToString(f, calendarLocale);
		});

		const zeroBased = $.derived(() => timeFormat()(new Date(0, 0, 0, 1)).indexOf("01") != -1);

		$$renderer.push(`<div${$.attr_class('wx-timepicker svelte-sxn4ra', void 0, { 'wx-error': error, 'wx-disabled': disabled })}>`);

		Text($$renderer, {
			id,
			css,
			title,
			value: textValue(),
			readonly: true,
			disabled,
			error,
			icon: 'wxi-clock',
			inputStyle: 'cursor: pointer; width: 100%; padding-right: calc(var(--wx-input-icon-size) + var(--wx-input-icon-indent) * 2);'
		});

		$$renderer.push(`<!----> `);

		if (popup && !disabled) {
			$$renderer.push('<!--[0-->');

			Dropdown($$renderer, {
				oncancel,
				width: "unset",
				children: ($$renderer) => {
					$$renderer.push(`<div class="wx-wrapper svelte-sxn4ra"><div class="wx-timer svelte-sxn4ra"><input class="wx-digit svelte-sxn4ra"${$.attr('value', hText())}/> <div class="wx-separator svelte-sxn4ra">:</div> <input class="wx-digit svelte-sxn4ra"${$.attr('value', mText())}/> `);

					if (h12) {
						$$renderer.push('<!--[0-->');

						{
							function active($$renderer) {
								$$renderer.push(`<span>pm</span>`);
							}

							TwoState($$renderer, {
								value: pm(),
								onclick: togglePM,
								active,
								children: ($$renderer) => {
									$$renderer.push(`<span>am</span>`);
								},
								$$slots: { active: true, default: true }
							});
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					Field($$renderer, {
						width: "unset",
						children: ($$renderer) => {
							Slider($$renderer, {
								label: calendarLocale.hours,
								width: "unset",
								value: h(),
								onchange: setHours,
								max: maxH
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Field($$renderer, {
						width: "unset",
						children: ($$renderer) => {
							Slider($$renderer, {
								label: calendarLocale.minutes,
								width: "unset",
								value: m(),
								onchange: setMinutes,
								max: maxM
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}