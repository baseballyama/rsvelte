import * as $ from 'svelte/internal/server';
import { colord } from 'colord';
import { Slider } from 'svelte-awesome-slider';

export default function Picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** customize the ColorPicker component parts. Can be used to display a Chrome variant or an Accessibility Notice */
		/** hue value */
		/** saturation value */
		/** vibrance value */
		/** indicator whether the selected color is light or dark */
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		/** listener, dispatch an event when the user drags, clicks or tabs at the picker */
		let {
			components,
			h,
			s = void 0,
			v = void 0,
			isDark,
			texts,
			onInput
		} = $$props;

		let picker = void 0;
		let isMouseDown = false;
		let pos = { x: 100, y: 0 };
		let pickerColorBg = $.derived(() => colord({ h, s: 100, v: 100, a: 1 }).toHex());

		function clamp(value, min, max) {
			return Math.min(Math.max(min, value), max);
		}

		function onClick(e) {
			if (!picker) return;

			const { width, left, height, top } = picker.getBoundingClientRect();

			const mouse = {
				x: clamp(e.clientX - left, 0, width),
				y: clamp(e.clientY - top, 0, height)
			};

			s = clamp(mouse.x / width, 0, 1) * 100;
			v = clamp((height - mouse.y) / height, 0, 1) * 100;
			updateColor();
		}

		function pickerMousedown(e) {
			e.preventDefault();

			if (e.button === 0) {
				isMouseDown = true;
				onClick(e);
			}
		}

		function mouseUp() {
			isMouseDown = false;
		}

		function mouseMove(e) {
			if (isMouseDown) onClick(e);
		}

		function touch(e) {
			e.preventDefault();
			onClick(e.changedTouches[0]);
		}

		function updateColor(color = {}) {
			onInput({ s, v, ...color });
		}

		$$renderer.push(`<div class="picker svelte-1f35vwa"${$.attr_style('', { '--picker-color-bg': pickerColorBg() })}>`);

		if (components.pickerIndicator) {
			$$renderer.push('<!--[-->');
			components.pickerIndicator($$renderer, { pos, isDark });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <div class="s svelte-1f35vwa"${$.attr_style('', { '--pos-y': pos.y })}>`);

		Slider($$renderer, {
			value: s,
			onInput: (s) => updateColor({ s }),
			keyboardOnly: true,
			ariaValueText: (value) => `${value}%`,
			ariaLabel: texts.label.s
		});

		$$renderer.push(`<!----></div> <div class="v svelte-1f35vwa"${$.attr_style('', { '--pos-x': pos.x })}>`);

		Slider($$renderer, {
			value: v,
			onInput: (v) => updateColor({ v }),
			keyboardOnly: true,
			ariaValueText: (value) => `${value}%`,
			direction: 'vertical',
			ariaLabel: texts.label.v
		});

		$$renderer.push(`<!----></div></div>`);
		$.bind_props($$props, { s, v });
	});
}