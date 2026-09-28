import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DevOnly from '$lib/components/DevOnly.svelte';
import Console from '$lib/components/icons/Console.svelte';
import Inspect from '$lib/Inspect.svelte';
import { colord } from 'colord';
import HueRotate from './HueRotate.svelte';
import { themes } from './themes.js';
import Theming from './Theming.svelte';
import { createPageTitle } from '$doclib/util.js';

var root = $.from_html(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&amp;family=Fira+Code:wght@300..700&amp;family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&amp;family=Inconsolata:wght@200..900&amp;family=Reddit+Mono:wght@200..900&amp;family=Roboto+Mono:ital,wght@0,100..700;1,100..700&amp;family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&amp;family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&amp;display=swap" rel="stylesheet"/>`, 1);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<button type="button" title="lock" class="unstyled sm lock svelte-c49e4a"><small> </small></button>`);
var root_3 = $.from_html(`<label class="color svelte-c49e4a"> <div class="colorpicker svelte-c49e4a"><input type="color" class="svelte-c49e4a"/></div> <!></label>`);
var root_4 = $.from_html(`<br/>`);
var root_5 = $.from_html(`<span class="key svelte-c49e4a"> </span>: <span class="value svelte-c49e4a"> </span>;<!>`, 1);
var root_6 = $.from_html(`<span class="value svelte-c49e4a" style="padding-left: 1em;"> </span>=<span style="color: var(--yellow);"> </span><!>`, 1);

var root_7 = $.from_html(
	`<div class="flex row gap align-end svelte-c49e4a"><label class="svelte-c49e4a">presets <select></select></label> <button>load</button></div> <div class="colors-and-preview svelte-c49e4a"><div class="colors svelte-c49e4a"></div> <div style="flex-basis: 100%"><svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper></div></div> <div class="flex row flex-wrap gap svelte-c49e4a"><label class="svelte-c49e4a">indent (em) <input type="number" style="max-width: 5em"/></label> <label class="svelte-c49e4a">font <select><option>monospace (system)</option><option>Roboto Mono</option><option>Inconsolata</option><option>Source Code Pro</option><option>IBM Plex Mono</option><option>Courier Prime</option><option>Ubuntu Mono</option><option>Fira Code</option><option>Reddit Mono</option><option disabled="">Local install required:</option><option>Consolas</option><option>Pixel Code</option><option>Dank Mono</option><option>Andale Mono</option></select></label> <label class="svelte-c49e4a">font-size <input type="number"/></label> <button title="output theme object to console" class="unstyled" style="width: 2em; height: 2em;"><!></button> <button class="unstyled" type="button">undo</button> <button class="unstyled" type="button">redo</button></div> <!> <!> <h2 id="defining-a-theme">Defining a theme</h2> <p>Add your custom theme class to a global css file and import it, then set the theme-class using the
  class or theme-prop on the inspect component or via global options.</p> <pre class="svelte-c49e4a"><span class="selector svelte-c49e4a">.my-inspect-theme</span> <!> </pre> <p>Alternatively, set css variables directly on the component.</p> <pre class="svelte-c49e4a"> <span style="color:var(--blue);">Inspect</span>
  <span style="color: var(--green)">theme</span>=""
<!> </pre> <h2 id="extended-theming">Extended customization</h2> <p>Behind the scenes, the base16 theme is mapped to internal CSS-variables. This mapping can be
  overriden by setting additional CSS-variables on your custom theme class or passing them to the
  component.<br/> See the <a href="/theming/vars">full overview</a> of available css-variables than can be passed to <code>Inspect</code>.</p> <pre class="svelte-c49e4a"> <span style="color:var(--blue);">Inspect</span>
<span style="padding-left: 1em;color: var(--green);">theme</span>=<span style="color: var(--yellow);">"inspect"</span>
<span style="padding-left: 1em;color: var(--green);">value</span>=<span style="color: var(--yellow);"></span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--inspect-background</span>=<span style="color: var(--yellow);">"linear-gradient(45deg, var(--base00) 50%, hotpink)"</span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--caret-color</span>=<span style="color: var(--yellow);">"white"</span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--caret-focus-color</span>=<span style="color: var(--yellow);">"hotpink"</span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--bullet-color</span>=<span style="color: var(--yellow);">"hotpink"</span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--string-value-color</span>=<span style="color: var(--yellow);">"var(--base08)"</span> </pre> Result: <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let font = $.state('monospace');
	let fontSize = $.state(12);
	let fontSizePx = $.derived(() => $.get(fontSize) + 'px');
	let indent = $.state(0.75);
	let colors = $.state($.proxy({ ...themes.inspect }));
	let lockedColors = $.state($.proxy([]));
	let keys = $.derived(() => Object.keys($.get(colors)));
	let rotated = $.state(void 0);
	let rotation = $.state(0);
	let steps = $.proxy([{ ...themes.inspect }]);
	let currentStep = $.state(0);
	let currentColors = $.derived(() => $.get(rotated) == null ? $.get(colors) : $.get(rotated));
	let style = $.derived(() => $.get(keys).map((k) => `${k}: ${$.get(currentColors)[k]};`).join(''));
	let presets = Object.keys(themes);
	let selectedPreset = $.state('inspect');

	$.user_effect(() => {
		if ($.get(rotation) !== 0) rotateColors($.get(rotation));
	});

	function rotateColors(value) {
		$.set(
			rotated,
			{
				...Object.fromEntries($.get(keys).map((k) => [
					k,
					$.get(lockedColors).includes(k)
						? $.get(colors)[k]
						: colord($.get(colors)[k]).rotate(value).toHex()
				]))
			},
			true
		);
	}

	function loadPreset() {
		applyToUnlocked({ ...themes[$.get(selectedPreset)] });
		saveStep();
		$.set(rotated, undefined);
		$.set(rotation, 0);
	}

	function applyToUnlocked(newColors) {
		$.set(
			colors,
			Object.fromEntries($.get(keys).map((k) => {
				if ($.get(lockedColors).includes(k)) {
					return [k, $.get(colors)[k]];
				} else {
					return [k, newColors[k]];
				}
			})),
			true
		);
	}

	function undo() {
		let prevStep = steps[$.get(currentStep) - 1];

		if (prevStep) {
			$.set(colors, { ...prevStep }, true);
			$.set(currentStep, $.get(currentStep) - 1);
		}
	}

	function redo() {
		let nextStep = steps[$.get(currentStep) + 1];

		if (nextStep) {
			$.set(colors, { ...nextStep }, true);
			$.set(currentStep, $.get(currentStep) + 1);
		}
	}

	function saveStep(changeCurrentStep = true) {
		steps.push($.snapshot($.get(colors)));

		if (changeCurrentStep) $.set(currentStep, steps.length - 1);
	}

	var fragment_1 = root_7();

	$.head('c49e4a', ($$anchor) => {
		var fragment = root();

		$.next(4);

		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('Define Theme')]
		);

		$.append($$anchor, fragment);
	});

	var div = $.first_child(fragment_1);
	var label = $.child(div);
	var select = $.sibling($.child(label));

	$.each(select, 20, () => presets, (preset) => preset, ($$anchor, preset) => {
		var option = root_1();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, preset);

			if (option_value !== (option_value = preset)) {
				option.__value = option_value;
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(label);

	var button = $.sibling(label, 2);

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);

	$.each(div_2, 20, () => $.get(keys), (key) => key, ($$anchor, key) => {
		const locked = $.derived(() => $.get(lockedColors).includes(key));
		var label_1 = root_3();
		var text_1 = $.child(label_1);
		var div_3 = $.sibling(text_1);
		var input = $.child(div_3);

		input.defaultValue = '#ffffff';
		$.reset(div_3);

		var node = $.sibling(div_3, 2);

		DevOnly(node, {
			children: ($$anchor, $$slotProps) => {
				var button_1 = root_2();
				var small = $.child(button_1);
				var text_2 = $.only_child(small, true);

				$.reset(button_1);
				$.template_effect(() => $.set_text(text_2, $.get(locked) ? 'unlock' : 'lock'));

				$.delegated('click', button_1, () => {
					if ($.get(locked)) {
						$.set(lockedColors, $.get(lockedColors).filter((k) => k !== key), true);
					} else {
						$.get(lockedColors).push(key);
					}
				});

				$.append($$anchor, button_1);
			},
			$$slots: { default: true }
		});

		$.reset(label_1);

		$.template_effect(
			($0) => {
				$.set_text(text_1, `${$0 ?? ''} `);
				input.disabled = $.get(rotated) != null || $.get(locked);
			},
			[() => key.replaceAll('--base', '')]
		);

		$.delegated('change', input, () => saveStep());
		$.bind_value(input, () => $.get(currentColors)[key], ($$value) => $.get(currentColors)[key] = $$value);
		$.append($$anchor, label_1);
	});

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_1 = $.child(div_4);

	{
		$.css_props(node_1, () => ({
			'--indent': `${$.get(indent) ?? ''}em`,
			'--inspect-font': $.get(font),
			'--inspect-font-size': $.get(fontSizePx)
		}));

		Theming(node_1.lastChild, {
			get style() {
				return $.get(style);
			},

			get colors() {
				return $.get(colors);
			}
		});

		$.reset(node_1);
	}

	$.reset(div_4);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var label_2 = $.child(div_5);
	var input_1 = $.sibling($.child(label_2));

	$.remove_input_defaults(input_1);
	$.set_attribute(input_1, 'step', 0.125);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var select_1 = $.sibling($.child(label_3));
	var option_1 = $.child(select_1);

	option_1.value = option_1.__value = 'monospace';
	$.next(13);
	$.reset(select_1);
	$.init_select(select_1);
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var input_2 = $.sibling($.child(label_4));

	$.remove_input_defaults(input_2);
	$.reset(label_4);

	var button_2 = $.sibling(label_4, 2);
	var node_2 = $.child(button_2);

	Console(node_2, {});
	$.reset(button_2);

	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);

	$.reset(div_5);

	var node_3 = $.sibling(div_5, 2);

	HueRotate(node_3, {
		oncancel: () => {
			$.set(rotated, undefined);
			$.set(rotation, 0);
		},

		onapply: () => {
			if ($.get(rotated)) applyToUnlocked({ ...$.get(rotated) });

			saveStep();
			$.set(rotated, undefined);
			$.set(rotation, 0);
		},

		get rotation() {
			return $.get(rotation);
		},

		set rotation($$value) {
			$.set(rotation, $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	DevOnly(node_4, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ({ steps, currentStep: $.get(currentStep) }));

				Inspect($$anchor, {
					get value() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_4, 6);
	var text_3 = $.sibling($.child(pre));

	text_3.nodeValue = ' {\n';

	var node_5 = $.sibling(text_3);

	$.each(node_5, 18, () => $.get(keys), (key) => key, ($$anchor, key, i) => {
		var fragment_3 = root_5();
		var span = $.first_child(fragment_3);
		var text_4 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_5 = $.only_child(span_1, true);
		var node_6 = $.sibling(span_1, 2);

		{
			var consequent = ($$anchor) => {
				var br = root_4();

				$.append($$anchor, br);
			};

			$.if(node_6, ($$render) => {
				if ($.get(i) !== 15) $$render(consequent);
			});
		}

		$.template_effect(() => {
			$.set_text(text_4, key);
			$.set_text(text_5, $.get(colors)[key]);
		});

		$.append($$anchor, fragment_3);
	});

	var text_6 = $.sibling(node_5);

	text_6.nodeValue = '\n}';
	$.reset(pre);

	var pre_1 = $.sibling(pre, 4);
	var text_7 = $.child(pre_1, true);

	text_7.nodeValue = '<';

	var node_7 = $.sibling(text_7, 5);

	$.each(node_7, 18, () => $.get(keys), (key) => key, ($$anchor, key, i) => {
		var fragment_4 = root_6();
		var span_2 = $.first_child(fragment_4);
		var text_8 = $.only_child(span_2, true);
		var span_3 = $.sibling(span_2, 2);
		var text_9 = $.only_child(span_3);
		var node_8 = $.sibling(span_3);

		{
			var consequent_1 = ($$anchor) => {
				var br_1 = root_4();

				$.append($$anchor, br_1);
			};

			$.if(node_8, ($$render) => {
				if ($.get(i) !== 15) $$render(consequent_1);
			});
		}

		$.template_effect(() => {
			$.set_text(text_8, key);
			$.set_text(text_9, `"${$.get(colors)[key] ?? ''}"`);
		});

		$.append($$anchor, fragment_4);
	});

	var text_10 = $.sibling(node_7);

	text_10.nodeValue = '\n/>\n';
	$.reset(pre_1);

	var pre_2 = $.sibling(pre_1, 6);
	var text_11 = $.child(pre_2, true);

	text_11.nodeValue = '<';

	var span_4 = $.sibling(text_11, 9);

	span_4.textContent = '{...}';

	var text_12 = $.sibling(span_4, 21);

	text_12.nodeValue = '\n/>\n';
	$.reset(pre_2);

	var node_9 = $.sibling(pre_2, 2);

	{
		$.css_props(node_9, () => ({
			'--inspect-background': 'linear-gradient(45deg, var(--base00) 50%, hotpink)',
			'--caret-color': 'white',
			'--caret-focus-color': 'hotpink',
			'--bullet-color': 'hotpink',
			'--string-value-color': 'var(--base08)'
		}));

		Inspect(node_9.lastChild, {
			theme: 'inspect',
			value: { test: 'lorem ipsum dolor sit amet' }
		});

		$.reset(node_9);
	}

	$.template_effect(() => {
		button_3.disabled = steps[$.get(currentStep) - 1] == null;
		button_4.disabled = steps[$.get(currentStep) + 1] == null;
	});

	$.bind_select_value(select, () => $.get(selectedPreset), ($$value) => $.set(selectedPreset, $$value));
	$.delegated('click', button, loadPreset);
	$.bind_value(input_1, () => $.get(indent), ($$value) => $.set(indent, $$value));
	$.bind_select_value(select_1, () => $.get(font), ($$value) => $.set(font, $$value));
	$.bind_value(input_2, () => $.get(fontSize), ($$value) => $.set(fontSize, $$value));

	$.delegated('click', button_2, () => {
		// eslint-disable-next-line no-console
		console.log($.snapshot($.get(colors)));
	});

	$.delegated('click', button_3, undo);
	$.delegated('click', button_4, redo);
	$.append($$anchor, fragment_1);
	$.pop();
}

$.delegate(['click', 'change']);