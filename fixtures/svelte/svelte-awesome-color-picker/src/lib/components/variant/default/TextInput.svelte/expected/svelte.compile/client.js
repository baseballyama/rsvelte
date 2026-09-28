import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input class="svelte-12x11tl"/>`);
var root_1 = $.from_html(`<input type="number" min="0" max="255" class="svelte-12x11tl"/> <input type="number" min="0" max="255" class="svelte-12x11tl"/> <input type="number" min="0" max="255" class="svelte-12x11tl"/>`, 1);
var root_2 = $.from_html(`<input type="number" min="0" max="360" class="svelte-12x11tl"/> <input type="number" min="0" max="100" class="svelte-12x11tl"/> <input type="number" min="0" max="100" class="svelte-12x11tl"/>`, 1);
var root_3 = $.from_html(`<input type="number" min="0" max="1" step="0.01" class="svelte-12x11tl"/>`);
var root_4 = $.from_html(`<button type="button" class="svelte-12x11tl"><span class="disappear svelte-12x11tl" aria-hidden="true"> </span> <span class="appear svelte-12x11tl"> </span></button>`);
var root_5 = $.from_html(`<div class="button-like svelte-12x11tl"> </div>`);
var root_6 = $.from_html(`<div class="text-input svelte-12x11tl"><div class="input-container svelte-12x11tl"><!> <!></div> <!></div>`);

export default function TextInput($$anchor, $$props) {
	$.push($$props, true);

	/** if set to false, disables the alpha channel */
	/** rgb color */
	/** hsv color */
	/** hex color */
	/** configure which hex, rgb and hsv inputs will be visible and in which order. If overridden, it is necessary to provide at least one value */
	/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
	/** listener, dispatch an event when one of the color changes */
	let rgb = $.prop($$props, 'rgb', 15),
		hsv = $.prop($$props, 'hsv', 15),
		hex = $.prop($$props, 'hex', 15);

	const HEX_COLOR_REGEX = /^#?([A-F0-9]{6}|[A-F0-9]{8})$/i;
	let mode = $.derived(() => $$props.textInputModes[0] || 'hex');
	let nextMode = $.derived(() => $$props.textInputModes[($$props.textInputModes.indexOf($.get(mode)) + 1) % $$props.textInputModes.length]);
	let h = $.derived(() => Math.round(hsv().h));
	let s = $.derived(() => Math.round(hsv().s));
	let v = $.derived(() => Math.round(hsv().v));
	let a = $.derived(() => hsv().a === undefined ? 1 : Math.round(hsv().a * 100) / 100);

	function updateHex(e) {
		const target = e.target;

		if (HEX_COLOR_REGEX.test(target.value)) {
			hex(target.value);
			$$props.onInput({ hex: hex() });
		}
	}

	function updateRgb(property) {
		return function (e) {
			let value = parseFloat(e.target.value);

			rgb({ ...rgb(), [property]: isNaN(value) ? 0 : value });
			$$props.onInput({ rgb: rgb() });
		};
	}

	function updateHsv(property) {
		return function (e) {
			let value = parseFloat(e.target.value);

			hsv({ ...hsv(), [property]: isNaN(value) ? 0 : value });
			$$props.onInput({ hsv: hsv() });
		};
	}

	var div = root_6();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var input = root();

			$.remove_input_defaults(input);
			$.set_style(input, '', {}, { flex: 3 });

			$.template_effect(() => {
				$.set_attribute(input, 'aria-label', $$props.texts.label.hex);
				$.set_value(input, hex());
			});

			$.delegated('input', input, updateHex);
			$.append($$anchor, input);
		};

		var consequent_1 = ($$anchor) => {
			var fragment = root_1();
			var input_1 = $.first_child(fragment);

			$.remove_input_defaults(input_1);

			var event_handler = $.derived(() => updateRgb('r'));
			var input_2 = $.sibling(input_1, 2);

			$.remove_input_defaults(input_2);

			var event_handler_1 = $.derived(() => updateRgb('g'));
			var input_3 = $.sibling(input_2, 2);

			$.remove_input_defaults(input_3);

			var event_handler_2 = $.derived(() => updateRgb('b'));

			$.template_effect(() => {
				$.set_attribute(input_1, 'aria-label', $$props.texts.label.r);
				$.set_value(input_1, rgb().r);
				$.set_attribute(input_2, 'aria-label', $$props.texts.label.g);
				$.set_value(input_2, rgb().g);
				$.set_attribute(input_3, 'aria-label', $$props.texts.label.b);
				$.set_value(input_3, rgb().b);
			});

			$.delegated('input', input_1, function (...$$args) {
				$.get(event_handler)?.apply(this, $$args);
			});

			$.delegated('input', input_2, function (...$$args) {
				$.get(event_handler_1)?.apply(this, $$args);
			});

			$.delegated('input', input_3, function (...$$args) {
				$.get(event_handler_2)?.apply(this, $$args);
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();
			var input_4 = $.first_child(fragment_1);

			$.remove_input_defaults(input_4);

			var event_handler_3 = $.derived(() => updateHsv('h'));
			var input_5 = $.sibling(input_4, 2);

			$.remove_input_defaults(input_5);

			var event_handler_4 = $.derived(() => updateHsv('s'));
			var input_6 = $.sibling(input_5, 2);

			$.remove_input_defaults(input_6);

			var event_handler_5 = $.derived(() => updateHsv('v'));

			$.template_effect(() => {
				$.set_attribute(input_4, 'aria-label', $$props.texts.label.h);
				$.set_value(input_4, $.get(h));
				$.set_attribute(input_5, 'aria-label', $$props.texts.label.s);
				$.set_value(input_5, $.get(s));
				$.set_attribute(input_6, 'aria-label', $$props.texts.label.v);
				$.set_value(input_6, $.get(v));
			});

			$.delegated('input', input_4, function (...$$args) {
				$.get(event_handler_3)?.apply(this, $$args);
			});

			$.delegated('input', input_5, function (...$$args) {
				$.get(event_handler_4)?.apply(this, $$args);
			});

			$.delegated('input', input_6, function (...$$args) {
				$.get(event_handler_5)?.apply(this, $$args);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(mode) === 'hex') $$render(consequent); else if ($.get(mode) === 'rgb') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var input_7 = root_3();

			$.remove_input_defaults(input_7);

			var event_handler_6 = $.derived(() => $.get(mode) === 'hsv' ? updateHsv('a') : updateRgb('a'));

			$.template_effect(() => {
				$.set_attribute(input_7, 'aria-label', $$props.texts.label.a);
				$.set_value(input_7, $.get(a));
			});

			$.delegated('input', input_7, function (...$$args) {
				$.get(event_handler_6)?.apply(this, $$args);
			});

			$.append($$anchor, input_7);
		};

		$.if(node_1, ($$render) => {
			if ($$props.isAlpha) $$render(consequent_2);
		});
	}

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var button = root_4();
			var span = $.child(button);
			var text = $.only_child(span, true);
			var span_1 = $.sibling(span, 2);
			var text_1 = $.only_child(span_1);

			$.reset(button);

			$.template_effect(() => {
				$.set_text(text, $$props.texts.color[$.get(mode)]);
				$.set_text(text_1, `${$$props.texts.changeTo ?? ''} ${$$props.texts.color[$.get(nextMode)] ?? ''}`);
			});

			$.delegated('click', button, () => $.set(mode, $.get(nextMode)));
			$.append($$anchor, button);
		};

		var alternate_1 = ($$anchor) => {
			var div_2 = root_5();
			var text_2 = $.only_child(div_2, true);

			$.template_effect(() => $.set_text(text_2, $$props.texts.color[$.get(mode)]));
			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if ($$props.textInputModes.length > 1) $$render(consequent_3); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input', 'click']);