import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from "svelte";
import Button from "./Button.svelte";
import { sliderMove } from "./helpers/sliderMove";
import colorTransformator from "./helpers/colorTransformator";
import { parseColor } from "./helpers/colorValidation.js";
import { defaultLocale } from "./helpers/locale";

var root = $.from_html(`<div><div class="wx-color-block svelte-a8fdvd"><div class="wx-color-block-slider wx-slider svelte-a8fdvd" tabindex="0"></div></div> <div class="wx-color-line svelte-a8fdvd"><div class="wx-color-line-slider wx-slider svelte-a8fdvd" tabindex="0"></div></div> <div class="wx-color-controls svelte-a8fdvd"><div class="wx-color svelte-a8fdvd"></div> <input type="text" class="wx-text svelte-a8fdvd"/></div> <!></div>`);

export default function ColorBoard($$anchor, $$props) {
	$.push($$props, true);

	//helpers
	let value = $.prop($$props, 'value', 15, "#65D3B3"),
		button = $.prop($$props, 'button', 3, false),
		css = $.prop($$props, 'css', 3, "");

	let block;
	const _ = (getContext("wx-i18n") || defaultLocale()).getGroup("core");
	const BLOCK = "Block";
	const LINE = "Line";
	let blockTop = $.state(void 0);
	let blockLeft = $.state(void 0);
	let hueColor = $.state(void 0);
	let colorLine = $.state(void 0);
	let lineLeft = $.state(void 0);
	let inputValue = $.state($.proxy(value()));
	let color = $.derived(() => parseColor(value()) || "#65D3B3");
	let blockColor = $.derived(() => colorTransformator.hvsToHex($.get(hueColor), 1, 1));

	function moveBlockSlider(dx, dy) {
		const { width, height } = block.getBoundingClientRect();

		if (dy < 0) dy = 0; else if (dy > height) dy = height;
		if (dx < 0) dx = 0; else if (dx > width) dx = width;

		$.set(blockTop, dy, true);
		$.set(blockLeft, dx, true);
		setCurrentColor();
	}

	function setCurrentColor(lineSliderMove) {
		let _sValue, _vValue;

		if (lineSliderMove) {
			[, _sValue, _vValue] = colorTransformator.hexToHvs($.get(color));
		} else {
			const { width, height } = block.getBoundingClientRect();
			const pxX = width / 100;
			const pxY = height / 100;

			_sValue = Math.ceil($.get(blockLeft) / pxX) / 100;
			_vValue = Math.ceil(Math.abs($.get(blockTop) / pxY - 100)) / 100;
		}

		const currentColor = colorTransformator.hvsToHex($.get(hueColor), _sValue, _vValue);

		value(currentColor);
		$.set(inputValue, currentColor, true);
		$$props.onchange && $$props.onchange({ value: value(), input: true });
	}

	function moveLineSlider(dx) {
		const width = $.get(colorLine).getBoundingClientRect().width;

		if (dx < 0) dx = 0; else if (dx > width) dx = width;

		toggleLineColor(dx, width);
	}

	function toggleLineColor(dx, width) {
		width = width || $.get(colorLine).getBoundingClientRect().width;
		$.set(lineLeft, dx, true);

		const h = Math.round($.get(lineLeft) * 359 / width);

		$.set(hueColor, Math.max(Math.min(h, 359), 0), true);
		setCurrentColor(true);
	}

	onMount(() => requestAnimationFrame(setSlidersPosition));

	function setSlidersPosition() {
		const [h, s, v] = colorTransformator.hexToHvs($.get(color));
		const { width, height } = block.getBoundingClientRect();

		$.set(hueColor, h, true);
		$.set(lineLeft, h * $.get(colorLine).getBoundingClientRect().width / 359);
		$.set(blockLeft, s * width);
		$.set(blockTop, Math.abs(height * (v - 1)), true);
	}

	function handleInput({ target }) {
		const newColor = parseColor(target.value);

		$.set(inputValue, target.value, true);

		if (newColor) {
			value(newColor);
			$$props.onchange && $$props.onchange({ value: value(), input: true });
			setSlidersPosition();
		}
	}

	function handleSelect(ev) {
		ev.stopPropagation();
		$$props.onchange && $$props.onchange({ value: $.get(color) });
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

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.set_attribute(div_2, 'data-slider', BLOCK);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => block = $$value, () => block);
	$.action(div_1, ($$node, $$action_arg) => sliderMove?.($$node, $$action_arg), () => ({ moveBlockSlider }));

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);

	$.set_attribute(div_4, 'data-slider', LINE);
	$.reset(div_3);
	$.bind_this(div_3, ($$value) => $.set(colorLine, $$value), () => $.get(colorLine));
	$.action(div_3, ($$node, $$action_arg) => sliderMove?.($$node, $$action_arg), () => ({ moveLineSlider }));

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	var input = $.sibling(div_6, 2);

	$.remove_input_defaults(input);
	$.reset(div_5);

	var node = $.sibling(div_5, 2);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				onclick: handleSelect,
				type: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => _("select")]);
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (button()) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `wx-colorboard ${css() ?? ''}`, 'svelte-a8fdvd');
		$.set_style(div_1, `background: ${$.get(blockColor) ?? ''};`);
		$.set_style(div_2, `background: ${$.get(color) ?? ''}; top: ${$.get(blockTop) ?? ''}px; left:${$.get(blockLeft) ?? ''}px;`);
		$.set_style(div_4, `background: ${$.get(blockColor) ?? ''}; left: ${$.get(lineLeft) ?? ''}px;`);
		$.set_style(div_6, `background: ${$.get(color) ?? ''}`);
		$.set_value(input, $.get(inputValue));
	});

	$.delegated('keydown', div_2, keydown);
	$.delegated('keydown', div_4, keydown);
	$.delegated('input', input, handleInput);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'input']);