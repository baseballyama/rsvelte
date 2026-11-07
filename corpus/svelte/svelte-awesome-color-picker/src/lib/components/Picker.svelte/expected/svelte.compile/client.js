import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { colord } from 'colord';
import { Slider } from 'svelte-awesome-slider';

var root = $.from_html(`<div class="picker svelte-1f35vwa"><!> <div class="s svelte-1f35vwa"><!></div> <div class="v svelte-1f35vwa"><!></div></div>`);

export default function Picker($$anchor, $$props) {
	$.push($$props, true);

	/** customize the ColorPicker component parts. Can be used to display a Chrome variant or an Accessibility Notice */
	/** hue value */
	/** saturation value */
	/** vibrance value */
	/** indicator whether the selected color is light or dark */
	/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
	/** listener, dispatch an event when the user drags, clicks or tabs at the picker */
	let s = $.prop($$props, 's', 15),
		v = $.prop($$props, 'v', 15);

	let picker = $.state(void 0);
	let isMouseDown = false;
	let pos = $.state($.proxy({ x: 100, y: 0 }));
	let pickerColorBg = $.derived(() => colord({ h: $$props.h, s: 100, v: 100, a: 1 }).toHex());

	function clamp(value, min, max) {
		return Math.min(Math.max(min, value), max);
	}

	function onClick(e) {
		if (!$.get(picker)) return;

		const { width, left, height, top } = $.get(picker).getBoundingClientRect();

		const mouse = {
			x: clamp(e.clientX - left, 0, width),
			y: clamp(e.clientY - top, 0, height)
		};

		s(clamp(mouse.x / width, 0, 1) * 100);
		v(clamp((height - mouse.y) / height, 0, 1) * 100);
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

	$.user_effect(() => {
		if (typeof s() === 'number' && typeof v() === 'number' && $.get(picker)) $.set(pos, { x: s(), y: 100 - v() }, true);
	});

	function updateColor(color = {}) {
		$$props.onInput({ s: s(), v: v(), ...color });
	}

	var div = root();

	$.event('mouseup', $.window, mouseUp);
	$.event('mousemove', $.window, mouseMove);

	let styles;
	var node = $.child(div);

	$.component(node, () => $$props.components.pickerIndicator, ($$anchor, components_pickerIndicator) => {
		components_pickerIndicator($$anchor, {
			get pos() {
				return $.get(pos);
			},

			get isDark() {
				return $$props.isDark;
			}
		});
	});

	var div_1 = $.sibling(node, 2);
	let styles_1;
	var node_1 = $.child(div_1);

	Slider(node_1, {
		get value() {
			return s();
		},
		onInput: (s) => updateColor({ s }),
		keyboardOnly: true,
		ariaValueText: (value) => `${value}%`,
		get ariaLabel() {
			return $$props.texts.label.s;
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	let styles_2;
	var node_2 = $.child(div_2);

	Slider(node_2, {
		get value() {
			return v();
		},
		onInput: (v) => updateColor({ v }),
		keyboardOnly: true,
		ariaValueText: (value) => `${value}%`,
		direction: 'vertical',
		get ariaLabel() {
			return $$props.texts.label.v;
		}
	});

	$.reset(div_2);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(picker, $$value), () => $.get(picker));

	$.template_effect(() => {
		styles = $.set_style(div, '', styles, { '--picker-color-bg': $.get(pickerColorBg) });
		styles_1 = $.set_style(div_1, '', styles_1, { '--pos-y': $.get(pos).y });
		styles_2 = $.set_style(div_2, '', styles_2, { '--pos-x': $.get(pos).x });
	});

	$.delegated('mousedown', div, pickerMousedown);
	$.delegated('touchstart', div, touch, void 0, true);
	$.delegated('touchmove', div, touch, void 0, true);
	$.delegated('touchend', div, touch);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['mousedown', 'touchstart', 'touchmove', 'touchend']);