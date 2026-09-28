import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DemoDatePicker from './DemoDatePicker.svelte';
import DemoDateInput from './DemoDateInput.svelte';
import { Color } from 'color-picker-svelte';
import Prop from './prop.svelte';

var root = $.from_html(
	`<p>Date and time picker for Svelte</p> <p>Features:</p> <ul><li>Theming</li> <li>Custom formats</li> <li>Internationalization (i18n)</li> <li>Autopunctuation (e.g typing "20201111111111" gives you "2020-11-11 11:11:11" with the default
		format)</li> <li>Keyboard shortcuts</li></ul> <h2 id="install">Install</h2> <pre class="language-">npm install -D date-picker-svelte</pre> <div><h2 id="dateinput">DateInput</h2> <!> <h2 id="datepicker">DatePicker</h2> <!></div> <h2>Theming</h2> <div class="theming svelte-1uha8ag"><!> <!> <!> <!> <!> <!> <!></div>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	function readCssVar(name) {
		const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

		return new Color(value);
	}

	function getCssVars() {
		if (typeof document === 'undefined') {
			return {};
		}

		return {
			'--date-picker-foreground': readCssVar('--date-picker-foreground'),
			'--date-picker-background': readCssVar('--date-picker-background'),
			'--date-picker-highlight-border': readCssVar('--date-picker-highlight-border'),
			'--date-picker-highlight-shadow': readCssVar('--date-picker-highlight-shadow'),
			'--date-picker-today-border': readCssVar('--date-picker-today-border'),
			'--date-picker-selected-color': readCssVar('--date-picker-selected-color'),
			'--date-picker-selected-background': readCssVar('--date-picker-selected-background')
		};
	}

	let cssVars = $.state($.proxy(getCssVars()));

	$.user_effect(() => {
		const observer = new MutationObserver(async () => {
			$.set(cssVars, getCssVars(), true);
		});

		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

		return () => observer.disconnect();
	});

	var fragment = root();

	$.head('1uha8ag', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Date Picker Svelte';
		});
	});

	var div = $.sibling($.first_child(fragment), 10);
	var node = $.sibling($.child(div), 2);

	DemoDateInput(node, {});

	var node_1 = $.sibling(node, 4);

	DemoDatePicker(node_1, {});
	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var node_2 = $.child(div_1);

	Prop(node_2, {
		label: '--date-picker-foreground',
		labelWide: true,
		get value() {
			return $.get(cssVars)['--date-picker-foreground'];
		},

		set value($$value) {
			$.get(cssVars)['--date-picker-foreground'] = $$value;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Prop(node_3, {
		label: '--date-picker-background',
		labelWide: true,
		get value() {
			return $.get(cssVars)['--date-picker-background'];
		},

		set value($$value) {
			$.get(cssVars)['--date-picker-background'] = $$value;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Prop(node_4, {
		label: '--date-picker-highlight-border',
		labelWide: true,
		get value() {
			return $.get(cssVars)['--date-picker-highlight-border'];
		},

		set value($$value) {
			$.get(cssVars)['--date-picker-highlight-border'] = $$value;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Prop(node_5, {
		label: '--date-picker-highlight-shadow',
		labelWide: true,
		get value() {
			return $.get(cssVars)['--date-picker-highlight-shadow'];
		},

		set value($$value) {
			$.get(cssVars)['--date-picker-highlight-shadow'] = $$value;
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Prop(node_6, {
		label: '--date-picker-today-border',
		labelWide: true,
		get value() {
			return $.get(cssVars)['--date-picker-today-border'];
		},

		set value($$value) {
			$.get(cssVars)['--date-picker-today-border'] = $$value;
		}
	});

	var node_7 = $.sibling(node_6, 2);

	Prop(node_7, {
		label: '--date-picker-selected-color',
		labelWide: true,
		get value() {
			return $.get(cssVars)['--date-picker-selected-color'];
		},

		set value($$value) {
			$.get(cssVars)['--date-picker-selected-color'] = $$value;
		}
	});

	var node_8 = $.sibling(node_7, 2);

	Prop(node_8, {
		label: '--date-picker-selected-background',
		labelWide: true,
		get value() {
			return $.get(cssVars)['--date-picker-selected-background'];
		},

		set value($$value) {
			$.get(cssVars)['--date-picker-selected-background'] = $$value;
		}
	});

	$.reset(div_1);

	$.template_effect(($0) => $.set_style(div, $0), [
		() => Object.entries($.get(cssVars)).map(([key, value]) => {
			if (value === null) {
				return null;
			}

			return `${key}: ${value.toHex8String()};`;
		}).join('')
	]);

	$.append($$anchor, fragment);
	$.pop();
}