import * as $ from 'svelte/internal/server';
import { onMount, getContext } from "svelte";
import Button from "../Button.svelte";
import { sliderMove } from "../helpers/sliderMove";
import colorTransformator from "../helpers/colorTransformator";
import { parseColor } from "../helpers/colorValidation.js";

export default function Layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		//helpers
		let { value = "#65D3B3", button = false, onchange } = $$props;

		let block;
		const _ = getContext("wx-i18n").getGroup("core");
		const BLOCK = "Block";
		const LINE = "Line";
		let blockTop = void 0;
		let blockLeft = void 0;
		let hueColor = void 0;
		let colorLine = void 0;
		let lineLeft = void 0;
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

			value = colorTransformator.hvsToHex(hueColor, _sValue, _vValue);
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

		onMount(() => setSlidersPosition());

		function setSlidersPosition() {
			const [h, s, v] = colorTransformator.hexToHvs(color());
			const { width, height } = block.getBoundingClientRect();

			hueColor = h;
			lineLeft = h * colorLine.getBoundingClientRect().width / 359;
			blockLeft = s * width;
			blockTop = Math.abs(height * (v - 1));
		}

		function handleChange({ target }) {
			const newColor = parseColor(target.value);

			value = newColor;
			onchange && onchange({ value, input: true });

			if (newColor) {
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

		$$renderer.push(`<div class="wx-colorboard svelte-1r3unn0"><div class="wx-color-block svelte-1r3unn0"${$.attr_style(`background: ${$.stringify(blockColor())};`)}><div class="wx-color-block-slider wx-slider svelte-1r3unn0"${$.attr_style(`background: ${$.stringify(color())}; top: ${$.stringify(blockTop)}px; left:${$.stringify(blockLeft)}px;`)} tabindex="0"${$.attr('data-slider', BLOCK)}></div></div> <div class="wx-color-line svelte-1r3unn0"><div class="wx-color-line-slider wx-slider svelte-1r3unn0"${$.attr_style(`background: ${$.stringify(blockColor())}; left: ${$.stringify(lineLeft)}px;`)} tabindex="0"${$.attr('data-slider', LINE)}></div></div> <div class="wx-color-controls svelte-1r3unn0"><div class="wx-color svelte-1r3unn0"${$.attr_style(`background: ${$.stringify(color())}`)}></div> <input type="text" class="wx-text svelte-1r3unn0"${$.attr('value', value)}/></div> `);

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