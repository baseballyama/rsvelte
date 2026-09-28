import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Inspect } from '@components';
import { StateHistory } from 'runed';
import ColorPicker from 'svelte-awesome-color-picker';
import { themes } from './themes.js';
import Theming from './Theming.svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&amp;family=Fira+Code:wght@300..700&amp;family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&amp;family=Inconsolata:wght@200..900&amp;family=Reddit+Mono:wght@200..900&amp;family=Roboto+Mono:ital,wght@0,100..700;1,100..700&amp;family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&amp;family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&amp;display=swap" rel="stylesheet"/>`, 1);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<div class="dark-picker svelte-9qolj2"><!></div>`);
var root_3 = $.from_html(`<br/>`);
var root_4 = $.from_html(`<span class="key svelte-9qolj2"> </span>: <span class="value svelte-9qolj2"> </span>;<!>`, 1);
var root_5 = $.from_html(`<span class="value svelte-9qolj2" style="padding-left: 1em;"> </span>=<span style="color: var(--yellow);"> </span><!>`, 1);

var root_6 = $.from_html(
	`<div class="controls svelte-9qolj2"><div class="sub-controls svelte-9qolj2"><label class="preset-loader svelte-9qolj2">Presets <select class="svelte-9qolj2"></select></label> <button class="svelte-9qolj2">Load</button></div> <label class="svelte-9qolj2">Background <select class="svelte-9qolj2"><option>bright</option><option>neutral</option><option>dark</option></select></label> <div class="sub-controls svelte-9qolj2"><label class="svelte-9qolj2">Panel <input type="checkbox" class="svelte-9qolj2"/></label> <label class="svelte-9qolj2">Borderless <input type="checkbox" class="svelte-9qolj2"/></label></div></div> <div class="colors-and-preview svelte-9qolj2"><svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <div class="colors not-content svelte-9qolj2"></div></div> <div class="controls svelte-9qolj2"><label class="svelte-9qolj2">Indent (em) <input type="number" style="max-width: 6em" class="svelte-9qolj2"/></label> <label class="svelte-9qolj2">Font <select class="svelte-9qolj2"><option>monospace (system)</option><option>Roboto Mono</option><option>Inconsolata</option><option>Source Code Pro</option><option>IBM Plex Mono</option><option>Courier Prime</option><option>Ubuntu Mono</option><option>Fira Code</option><option>Reddit Mono</option><option disabled="">Local install required:</option><option>Consolas</option><option>Pixel Code</option><option>Dank Mono</option><option>Andale Mono</option></select></label> <label class="svelte-9qolj2">Font size <input type="number" style="max-width: 6em" class="svelte-9qolj2"/></label> <button title="Output theme object to console" style="width: 2em; height: 2em;" class="svelte-9qolj2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19h8M4 17l6-6l-6-6"></path></svg></button> <button class="svelte-9qolj2">Undo</button> <button class="svelte-9qolj2">Redo</button></div> <!> <h2 id="defining-a-theme">Defining a theme</h2> <p>Add your custom theme class to a global css file and import it, then set the theme-class using the
  class or theme-prop on the inspect component or via global options.</p> <pre class="svelte-9qolj2"><span class="selector svelte-9qolj2">.my-inspect-theme</span> <!> </pre> <p>Alternatively, set css variables directly on the component.</p> <pre class="svelte-9qolj2"> <span style="color:var(--blue);">Inspect</span>
  <span style="color: var(--green)">theme</span>=""
<!> </pre> <em>Note: these code blocks are updated with colors set in the theme editor above</em> <h2 id="extended-theming">Extended customization</h2> <p>Behind the scenes, the base16 theme is mapped to internal CSS-variables. This mapping can be
  overriden by setting additional CSS-variables on your custom theme class or passing them to the
  component.<br/> See the <a href="/theming/vars">full overview</a> of available css-variables than can be passed to <code>Inspect</code>.</p> <pre class="svelte-9qolj2"> <span style="color:var(--blue);">Inspect</span>
<span style="padding-left: 1em;color: var(--green);">theme</span>=<span style="color: var(--yellow);">"inspect"</span>
<span style="padding-left: 1em;color: var(--green);">value</span>=<span style="color: var(--yellow);"></span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--inspect-background</span>=<span style="color: var(--yellow);">"linear-gradient(45deg, var(--base00) 50%, hotpink)"</span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--caret-color</span>=<span style="color: var(--yellow);">"#b4da55"</span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--caret-focus-color</span>=<span style="color: var(--yellow);">"hotpink"</span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--bullet-color</span>=<span style="color: var(--yellow);">"hotpink"</span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--string-value-color</span>=<span style="color: var(--yellow);">"var(--base08)"</span> </pre> Result: <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`,
	1
);

export default function DefineTheme($$anchor, $$props) {
	$.push($$props, true);

	// import Console from '$lib/components/icons/Console.svelte'
	let visible = $.state(false);

	onMount(() => {
		let tim = setTimeout(
			() => {
				$.set(visible, true);
			},
			600
		);

		return () => {
			clearTimeout(tim);
		};
	});

	let presets = Object.keys(themes);
	let selectedPreset = $.state('inspect');
	let preset = 'inspect';
	let panel = $.state(false);
	let backgroundColor = $.state('#808080');
	let borderless = $.state(false);
	let font = $.state('monospace');
	let fontSize = $.state(12);
	let fontSizePx = $.derived(() => $.get(fontSize) + 'px');
	let indent = $.state(0.75);
	let colors = $.state($.proxy({ ...themes.inspect }));
	let keys = $.derived(() => Object.keys($.get(colors)));
	let pickerOpen = $.proxy(Object.fromEntries($.get(keys).map((k) => [k, false])));
	let historySrc = $.proxy({ colors: { ...themes.inspect } });

	const history = new StateHistory(() => ({ ...historySrc }), (entry) => {
		$.set(colors, { ...entry.colors }, true);

		// selectedPreset = entry.selectedPreset
	});

	let style = $.derived(() => {
		return $.get(keys).map((k) => `${k}: ${$.get(colors)[k]};`).join('') + 'flex-basis: 100%;';
	});

	let wroteToHistoryOnce = false;

	$.user_effect(() => {
		if (Object.values(pickerOpen).every((v) => v === false)) {
			if (wroteToHistoryOnce) {
				historySrc.colors = { ...$.get(colors) };
			}

			wroteToHistoryOnce = true;
		}
	});

	function loadPreset() {
		applyColors({ ...themes[$.get(selectedPreset)] });
	}

	function applyColors(newColors) {
		$.set(
			colors,
			Object.fromEntries($.get(keys).map((k) => {
				return [k, newColors[k]];
			})),
			true
		);
	}

	var fragment_1 = root_6();

	$.head('9qolj2', ($$anchor) => {
		var fragment = root();

		$.next(4);
		$.append($$anchor, fragment);
	});

	var div = $.first_child(fragment_1);
	var div_1 = $.child(div);
	var label = $.child(div_1);
	var select = $.sibling($.child(label));

	$.each(select, 20, () => presets, (preset) => preset, ($$anchor, preset, $$index, $$array) => {
		var option = root_1();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, preset);

			if (option_value !== (option_value = preset)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(label);

	var button = $.sibling(label, 2);

	$.reset(div_1);

	var label_1 = $.sibling(div_1, 2);
	var select_1 = $.sibling($.child(label_1));
	var option_1 = $.child(select_1);

	option_1.value = option_1.__value = '#f2f2f2';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = '#808080';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = '#111';
	$.reset(select_1);
	$.init_select(select_1);
	$.reset(label_1);

	var div_2 = $.sibling(label_1, 2);
	var label_2 = $.child(div_2);
	var input = $.sibling($.child(label_2));

	$.remove_input_defaults(input);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_1 = $.sibling($.child(label_3));

	$.remove_input_defaults(input_1);
	$.reset(label_3);
	$.reset(div_2);
	$.reset(div);

	var div_3 = $.sibling(div, 2);
	let styles;
	var node = $.child(div_3);

	{
		$.css_props(node, () => ({
			'--preview-bg': $.get(backgroundColor),
			'--indent': `${$.get(indent) ?? ''}em`,
			'--inspect-font': $.get(font),
			'--inspect-font-size': $.get(fontSizePx)
		}));

		Theming(node.lastChild, {
			get borderless() {
				return $.get(borderless);
			},

			get panel() {
				return $.get(panel);
			},

			get colors() {
				return $.get(colors);
			},

			get style() {
				return $.get(style);
			}
		});

		$.reset(node);
	}

	var div_4 = $.sibling(node, 2);

	$.each(div_4, 21, () => $.get(keys), $.index, ($$anchor, key) => {
		var div_5 = root_2();
		var node_1 = $.child(div_5);

		{
			let $0 = $.derived(() => $.get(key).replaceAll('--base', ''));

			ColorPicker(node_1, {
				get hex() {
					return $.get(colors)[$.get(key)];
				},

				onInput: (color) => {
					$.set(colors, { ...$.get(colors), [$.get(key)]: color.hex }, true);
				},

				get label() {
					return $.get($0);
				},
				dir: 'rtl',
				get isOpen() {
					return pickerOpen[$.get(key)];
				},

				set isOpen($$value) {
					pickerOpen[$.get(key)] = $$value;
				}
			});
		}

		$.reset(div_5);
		$.append($$anchor, div_5);
	});

	$.reset(div_4);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);
	var label_4 = $.child(div_6);
	var input_2 = $.sibling($.child(label_4));

	$.remove_input_defaults(input_2);
	$.set_attribute(input_2, 'step', 0.125);
	$.reset(label_4);

	var label_5 = $.sibling(label_4, 2);
	var select_2 = $.sibling($.child(label_5));
	var option_4 = $.child(select_2);

	option_4.value = option_4.__value = 'monospace';
	$.next(13);
	$.reset(select_2);
	$.init_select(select_2);
	$.reset(label_5);

	var label_6 = $.sibling(label_5, 2);
	var input_3 = $.sibling($.child(label_6));

	$.remove_input_defaults(input_3);
	$.reset(label_6);

	var button_1 = $.sibling(label_6, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.reset(div_6);

	var node_2 = $.sibling(div_6, 2);

	{
		let $0 = $.derived(() => ({
			style: $.get(style),
			history: history.log.map((h) => h.snapshot)
		}));

		Inspect(node_2, {
			get values() {
				return $.get($0);
			}
		});
	}

	var pre = $.sibling(node_2, 6);
	var text_1 = $.sibling($.child(pre));

	text_1.nodeValue = ' {\n';

	var node_3 = $.sibling(text_1);

	$.each(node_3, 18, () => $.get(keys), (key) => key, ($$anchor, key, i) => {
		var fragment_2 = root_4();
		var span = $.first_child(fragment_2);
		var text_2 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_3 = $.only_child(span_1, true);
		var node_4 = $.sibling(span_1, 2);

		{
			var consequent = ($$anchor) => {
				var br = root_3();

				$.append($$anchor, br);
			};

			$.if(node_4, ($$render) => {
				if ($.get(i) !== 15) $$render(consequent);
			});
		}

		$.template_effect(() => {
			$.set_text(text_2, key);
			$.set_text(text_3, $.get(colors)[key]);
		});

		$.append($$anchor, fragment_2);
	});

	var text_4 = $.sibling(node_3);

	text_4.nodeValue = '\n}';
	$.reset(pre);

	var pre_1 = $.sibling(pre, 4);
	var text_5 = $.child(pre_1, true);

	text_5.nodeValue = '<';

	var node_5 = $.sibling(text_5, 5);

	$.each(node_5, 18, () => $.get(keys), (key) => key, ($$anchor, key, i) => {
		var fragment_3 = root_5();
		var span_2 = $.first_child(fragment_3);
		var text_6 = $.only_child(span_2, true);
		var span_3 = $.sibling(span_2, 2);
		var text_7 = $.only_child(span_3);
		var node_6 = $.sibling(span_3);

		{
			var consequent_1 = ($$anchor) => {
				var br_1 = root_3();

				$.append($$anchor, br_1);
			};

			$.if(node_6, ($$render) => {
				if ($.get(i) !== 15) $$render(consequent_1);
			});
		}

		$.template_effect(() => {
			$.set_text(text_6, key);
			$.set_text(text_7, `"${$.get(colors)[key] ?? ''}"`);
		});

		$.append($$anchor, fragment_3);
	});

	var text_8 = $.sibling(node_5);

	text_8.nodeValue = '\n/>\n';
	$.reset(pre_1);

	var pre_2 = $.sibling(pre_1, 8);
	var text_9 = $.child(pre_2, true);

	text_9.nodeValue = '<';

	var span_4 = $.sibling(text_9, 9);

	span_4.textContent = '{...}';

	var text_10 = $.sibling(span_4, 21);

	text_10.nodeValue = '\n/>\n';
	$.reset(pre_2);

	var node_7 = $.sibling(pre_2, 2);

	{
		$.css_props(node_7, () => ({
			'--inspect-background': 'linear-gradient(45deg, var(--base00) 50%, hotpink)',
			'--text-color': 'var(--base05)',
			'--caret-color': '#b4da55',
			'--caret-focus-color': 'hotpink',
			'--bullet-color': 'hotpink',
			'--string-value-color': 'var(--base08)'
		}));

		Inspect(node_7.lastChild, {
			theme: 'inspect',
			value: { test: 'lorem ipsum dolor sit amet' }
		});

		$.reset(node_7);
	}

	$.template_effect(() => {
		styles = $.set_style(div_3, '', styles, { opacity: $.get(visible) ? '1' : '0' });
		button_2.disabled = !history.canUndo;
		button_3.disabled = !history.canRedo;
	});

	$.bind_select_value(select, () => $.get(selectedPreset), ($$value) => $.set(selectedPreset, $$value));
	$.delegated('click', button, loadPreset);
	$.bind_select_value(select_1, () => $.get(backgroundColor), ($$value) => $.set(backgroundColor, $$value));
	$.bind_checked(input, () => $.get(panel), ($$value) => $.set(panel, $$value));
	$.bind_checked(input_1, () => $.get(borderless), ($$value) => $.set(borderless, $$value));
	$.bind_value(input_2, () => $.get(indent), ($$value) => $.set(indent, $$value));
	$.bind_select_value(select_2, () => $.get(font), ($$value) => $.set(font, $$value));
	$.bind_value(input_3, () => $.get(fontSize), ($$value) => $.set(fontSize, $$value));

	$.delegated('click', button_1, () => {
		// eslint-disable-next-line no-console
		console.log($.snapshot($.get(colors)));
	});

	$.delegated('click', button_2, () => history.undo());
	$.delegated('click', button_3, () => history.redo());
	$.append($$anchor, fragment_1);
	$.pop();
}

$.delegate(['click']);