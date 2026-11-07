import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { basicColors, transformColor, skipAddingToHistoryStack } from './helpers.js';
import MoveWrapper from './MoveWrapper.svelte';
import TextInput from '../input/TextInput.svelte';

var root = $.from_html(`<button type="button"></button>`);
var root_1 = $.from_html(`<div class="color-picker-saturation_cursor svelte-edbnig"></div>`);
var root_2 = $.from_html(`<div class="color-picker-hue_cursor svelte-edbnig"></div>`);
var root_3 = $.from_html(`<div class="color-picker-wrapper svelte-edbnig"><!> <div class="color-picker-basic-color svelte-edbnig"></div> <!> <!> <div class="color-picker-color svelte-edbnig"></div></div>`);

export default function ColorPicker($$anchor, $$props) {
	$.push($$props, true);

	const $skipAddingToHistoryStack = () => $.store_get(skipAddingToHistoryStack, '$skipAddingToHistoryStack', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const WIDTH = 214;
	const HEIGHT = 150;
	let selfColor = $.state($.proxy(transformColor('hex', $$props.color)));
	let inputColor = $.state($.proxy($$props.color));
	let innerDivRef = $.state(null);

	let saturationPosition = $.derived(() => ({
		x: $.get(selfColor).hsv.s / 100 * WIDTH,
		y: (100 - $.get(selfColor).hsv.v) / 100 * HEIGHT
	}));

	let huePosition = $.derived(() => ({ x: $.get(selfColor).hsv.h / 360 * WIDTH }));

	const onSetHex = (hex) => {
		$.set(inputColor, hex, true);

		if ((/^#[0-9A-Fa-f]{6}$/i).test(hex)) {
			const newColor = transformColor('hex', hex);

			$.set(selfColor, newColor, true);
		}
	};

	const onMoveSaturation = ({ x, y }) => {
		const newHsv = {
			...$.get(selfColor).hsv,
			s: x / WIDTH * 100,
			v: 100 - y / HEIGHT * 100
		};

		const newColor = transformColor('hsv', newHsv);

		$.set(selfColor, newColor, true);
		$.set(inputColor, newColor.hex, true);
	};

	const onMoveHue = ({ x }) => {
		const newHsv = { ...$.get(selfColor).hsv, h: x / WIDTH * 360 };
		const newColor = transformColor('hsv', newHsv);

		$.set(selfColor, newColor, true);
		$.set(inputColor, newColor.hex, true);
	};

	// Check if the dropdown is actually active
	$.user_effect(() => {
		if ($.get(innerDivRef) !== null && $$props.onChange) {
			$$props.onChange($.get(selfColor).hex, $skipAddingToHistoryStack());
			$.set(inputColor, $.get(selfColor).hex, true);
		}
	});

	$.user_effect(() => {
		if ($$props.color) {
			const newColor = transformColor('hex', $$props.color);

			$.set(selfColor, newColor, true);
			$.set(inputColor, newColor.hex, true);
		}
	});

	var div = root_3();

	$.set_style(div, 'width: 214px');

	var node = $.child(div);

	TextInput(node, {
		label: 'Hex',
		onChange: onSetHex,
		get value() {
			return $.get(inputColor);
		},
		width: '120px'
	});

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 21, () => basicColors, $.index, ($$anchor, basicColor) => {
		var button = root();

		$.template_effect(() => {
			$.set_class(button, 1, $.clsx($.get(basicColor) === $.get(selfColor).hex ? ' active' : ''), 'svelte-edbnig');
			$.set_style(button, `background-color: ${$.get(basicColor) ?? ''}`);
		});

		$.delegated('click', button, () => {
			$.set(inputColor, $.get(basicColor), true);
			$.set(selfColor, transformColor('hex', $.get(basicColor)), true);
		});

		$.append($$anchor, button);
	});

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	MoveWrapper(node_1, {
		className: 'color-picker-saturation',
		get style() {
			return `background-color: hsl(${$.get(selfColor).hsv.h ?? ''}, 100%, 50%)`;
		},
		onChange: onMoveSaturation,
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_1();

			$.template_effect(() => $.set_style(div_2, `background-color: ${$.get(selfColor).hex ?? ''}; left: ${$.get(saturationPosition).x ?? ''}px; top: ${$.get(saturationPosition).y ?? ''}px`));
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	MoveWrapper(node_2, {
		className: 'color-picker-hue',
		onChange: onMoveHue,
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_2();

			$.template_effect(() => $.set_style(div_3, `background-color: hsl(${$.get(selfColor).hsv.h ?? ''}, 100%, 50%); left: ${$.get(huePosition).x ?? ''}px`));
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var div_4 = $.sibling(node_2, 2);

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(innerDivRef, $$value), () => $.get(innerDivRef));
	$.template_effect(() => $.set_style(div_4, `background-color: ${$.get(selfColor).hex ?? ''}`));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);