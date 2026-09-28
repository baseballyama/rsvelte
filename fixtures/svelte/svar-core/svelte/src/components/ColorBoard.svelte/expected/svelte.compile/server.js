import * as $ from 'svelte/internal/server';
import { onMount, getContext } from "svelte";
import Button from "./Button.svelte";
import { sliderMove } from "./helpers/sliderMove";
import colorTransformator from "./helpers/colorTransformator";
import { parseColor } from "./helpers/colorValidation.js";
import { defaultLocale } from "./helpers/locale";

export default function ColorBoard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		//helpers
		let { value = "#65D3B3", button = false, css = "", onchange } = $$props;

		let block;
		const _ = (getContext("wx-i18n") || defaultLocale()).getGroup("core");
		const BLOCK = "Block";
		const LINE = "Line";
		let blockTop = void 0;
		let blockLeft = void 0;
		let hueColor = void 0;
		let colorLine = void 0;
		let lineLeft = void 0;
		let inputValue = value;
		let color = $.derived(() => parseColor(value) || "#65D3B3");
		let blockColor = $.derived(() => colorTransformator.hvsToHex(hueColor, 1, 1));

		function moveBlockSlider(dx, dy) {
			const { width, height } = block.getBoundingClientRect();

			if (dy < 0) dy = 0; else if (dy > height) dy = height;
			if (dx < 0) dx = 0; else if (dx > width) dx = width;

			blockTop = dy;
			blockLeft = dx;
			setCurrentColor();
		}

		function setCurrentColor(lineSliderMove) {
			let _sValue, _vValue;

			if (lineSliderMove) {
				[, _sValue, _vValue] = colorTransformator.hexToHvs(color());
			} else {
				const { width, height } = block.getBoundingClientRect();
				const pxX = width / 100;
				const pxY = height / 100;

				_sValue = Math.ceil(blockLeft / pxX) / 100;
				_vValue = Math.ceil(Math.abs(blockTop / pxY - 100)) / 100;
			}

			const currentColor = colorTransformator.hvsToHex(hueColor, _sValue, _vValue);

			value = currentColor;
			inputValue = currentColor;
			onchange && onchange({ value, input: true });
		}

		function moveLineSlider(dx) {
			const width = colorLine.getBoundingClientRect().width;

			if (dx < 0) dx = 0; else if (dx > width) dx = width;

			toggleLineColor(dx, width);
		}

		function toggleLineColor(dx, width) {
			width = width || colorLine.getBoundingClientRect().width;
			lineLeft = dx;

			const h = Math.round(lineLeft * 359 / width);

			hueColor = Math.max(Math.min(h, 359), 0);
			setCurrentColor(true);
		}

		onMount(() => requestAnimationFrame(setSlidersPosition));

		function setSlidersPosition() {
			const [h, s, v] = colorTransformator.hexToHvs(color());
			const { width, height } = block.getBoundingClientRect();

			hueColor = h;
			lineLeft = h * colorLine.getBoundingClientRect().width / 359;
			blockLeft = s * width;
			blockTop = Math.abs(height * (v - 1));
		}

		function handleInput({ target }) {
			const newColor = parseColor(target.value);

			inputValue = target.value;

			if (newColor) {
				value = newColor;
				onchange && onchange({ value, input: true });
				setSlidersPosition();
			}
		}

		function handleSelect(ev) {
			ev.stopPropagation();
			onchange && onchange({ value: color() });
		}

		function keydown(ev) {
			const slider = ev.target;
			const isSliderBlock = slider === BLOCK;
			const isSliderLine = slider === LINE;
			let css = window.getComputedStyle(slider);
			let left = parseFloat(css.left);
			let top = parseFloat(css.top);
			const code = ev.code;

			if (isSliderBlock) {
				switch (code) {
					case "ArrowLeft":
						{
							left--;

							break;
						}

					case "ArrowRight":
						{
							left++;

							break;
						}

					case "ArrowDown":
						{
							top++;

							break;
						}

					case "ArrowUp":
						{
							top--;

							break;
						}

					default:
						return;
				}

				moveBlockSlider(left, top);
			}

			if (isSliderLine) {
				if (code === "ArrowLeft" || code === "ArrowDown") left--; else if (code === "ArrowRight" || code === "ArrowUp") left++; else return;

				moveLineSlider(left);
			}

			ev.preventDefault();
		}

		$$renderer.push(`<div${$.attr_class(`wx-colorboard ${$.stringify(css)}`, 'svelte-a8fdvd')}><div class="wx-color-block svelte-a8fdvd"${$.attr_style(`background: ${$.stringify(blockColor())};`)}><div class="wx-color-block-slider wx-slider svelte-a8fdvd"${$.attr_style(`background: ${$.stringify(color())}; top: ${$.stringify(blockTop)}px; left:${$.stringify(blockLeft)}px;`)} tabindex="0"${$.attr('data-slider', BLOCK)}></div></div> <div class="wx-color-line svelte-a8fdvd"><div class="wx-color-line-slider wx-slider svelte-a8fdvd"${$.attr_style(`background: ${$.stringify(blockColor())}; left: ${$.stringify(lineLeft)}px;`)} tabindex="0"${$.attr('data-slider', LINE)}></div></div> <div class="wx-color-controls svelte-a8fdvd"><div class="wx-color svelte-a8fdvd"${$.attr_style(`background: ${$.stringify(color())}`)}></div> <input type="text" class="wx-text svelte-a8fdvd"${$.attr('value', inputValue)}/></div> `);

		if (button) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				onclick: handleSelect,
				type: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(_("select"))}`);
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