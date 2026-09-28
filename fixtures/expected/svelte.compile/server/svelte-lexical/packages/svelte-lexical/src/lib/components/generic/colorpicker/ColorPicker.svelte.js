import * as $ from 'svelte/internal/server';
import { basicColors, transformColor, skipAddingToHistoryStack } from './helpers.js';
import MoveWrapper from './MoveWrapper.svelte';
import TextInput from '../input/TextInput.svelte';

export default function ColorPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const WIDTH = 214;
		const HEIGHT = 150;
		let { color, onChange } = $$props;
		let selfColor = transformColor('hex', color);
		let inputColor = color;
		let innerDivRef = null;

		let saturationPosition = $.derived(() => ({
			x: selfColor.hsv.s / 100 * WIDTH,
			y: (100 - selfColor.hsv.v) / 100 * HEIGHT
		}));

		let huePosition = $.derived(() => ({ x: selfColor.hsv.h / 360 * WIDTH }));

		const onSetHex = (hex) => {
			inputColor = hex;

			if ((/^#[0-9A-Fa-f]{6}$/i).test(hex)) {
				const newColor = transformColor('hex', hex);

				selfColor = newColor;
			}
		};

		const onMoveSaturation = ({ x, y }) => {
			const newHsv = {
				...selfColor.hsv,
				s: x / WIDTH * 100,
				v: 100 - y / HEIGHT * 100
			};

			const newColor = transformColor('hsv', newHsv);

			selfColor = newColor;
			inputColor = newColor.hex;
		};

		const onMoveHue = ({ x }) => {
			const newHsv = { ...selfColor.hsv, h: x / WIDTH * 360 };
			const newColor = transformColor('hsv', newHsv);

			selfColor = newColor;
			inputColor = newColor.hex;
		};

		$$renderer.push(`<div class="color-picker-wrapper svelte-edbnig" style="width: 214px">`);

		TextInput($$renderer, {
			label: 'Hex',
			onChange: // Check if the dropdown is actually active
			onSetHex,
			value: inputColor,
			width: '120px'
		});

		$$renderer.push(`<!----> <div class="color-picker-basic-color svelte-edbnig"><!--[-->`);

		const each_array = $.ensure_array_like(basicColors);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let basicColor = each_array[$$index];

			$$renderer.push(`<button type="button"${$.attr_class($.clsx(basicColor === selfColor.hex ? ' active' : ''), 'svelte-edbnig')}${$.attr_style(`background-color: ${$.stringify(basicColor)}`)}></button>`);
		}

		$$renderer.push(`<!--]--></div> `);

		MoveWrapper($$renderer, {
			className: 'color-picker-saturation',
			style: `background-color: hsl(${$.stringify(selfColor.hsv.h)}, 100%, 50%)`,
			onChange: onMoveSaturation,
			children: ($$renderer) => {
				$$renderer.push(`<div class="color-picker-saturation_cursor svelte-edbnig"${$.attr_style(`background-color: ${$.stringify(selfColor.hex)}; left: ${$.stringify(saturationPosition().x)}px; top: ${$.stringify(saturationPosition().y)}px`)}></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		MoveWrapper($$renderer, {
			className: 'color-picker-hue',
			onChange: onMoveHue,
			children: ($$renderer) => {
				$$renderer.push(`<div class="color-picker-hue_cursor svelte-edbnig"${$.attr_style(`background-color: hsl(${$.stringify(selfColor.hsv.h)}, 100%, 50%); left: ${$.stringify(huePosition().x)}px`)}></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="color-picker-color svelte-edbnig"${$.attr_style(`background-color: ${$.stringify(selfColor.hex)}`)}></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}