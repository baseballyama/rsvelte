import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from 'svelte-inspect-value';
import { addComponent } from 'svelte-inspect-value';
import { onMount } from 'svelte';
import HexString from './HexString.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'panel',
	'style',
	'colors',
	'borderless'
]);

var root = $.from_html(`<div class="preview not-content svelte-tr6xsw"><div><!></div> <div><!></div></div>`);

export default function Theming($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

	class ClassName {}

	const base08Preview = $.proxy({
		numberType: 123,
		booleanType: true,
		error: new Error('i am an error'),
		tagNames: null,
		get keyPrefixes() {
			return class RandomClass {
				static asdf = '';
			};
		}
	});

	const base06Preview = $.proxy({ flashOnUpdateColor: 0 });

	$.user_effect(() => {
		let int = window.setInterval(
			() => {
				base06Preview.flashOnUpdateColor++;
			},
			1000
		);

		return () => {
			window.clearInterval(int);
		};
	});

	const base09Preview = Symbol('symbol type indicator');
	const base0BPreview = $.proxy([function funcNames() {}]);

	onMount(() => {
		const image = new Image();

		image.src = '/favicon.png';
		base08Preview.tagNames = image;

		// base08Preview.
		base0BPreview.push(document.body);
	});

	const base0CPreview = {
		objType: {},
		arrType: [],
		nodeNote: '["i was parsed!"]',
		date: new Date(),
		map: new Map([['#000', '#000']]),
		set: new Set(['#000', '#888', '#fff']),
		urls: new URL('https://example.com?q=test'),
		symbol: Symbol('symbol value color'),
		classInstances: new ClassName()
	};

	const base0DPreview = { classNames: ClassName };

	const base0EPreview = {
		stringType: '<--',
		numberValue: 1234,
		boolValue: true,
		get buttonColor() {
			return $$props.colors['--base0E'];
		}
	};

	const previewBrackets = [[[[[[[[[[[[[[[[[[['end']]]]]]]]]]]]]]]]]]];

	const functionBodyPreview = eval(`
(function base0B(base09, ...params) {
    // comments: base03
    class Base0D {
      static base08;
    }
    console.log(base05, ...params)
    while (true) {
      break;
    }
    this.base0B = params;
    const demo = {
      [Symbol('demo')]: Symbol.for('demo'),
      base0B: new Base0D(),
      number: 123456780,
      bigint: 1n,
      func: () => {}
    }
  
    return 'base0A' + demo.func + demo.func()
 })`);

	const theming = $.derived(() => ({
		base00: [$$props.colors['--base00'], 'background-color'],
		base01: [
			$$props.colors['--base01'],
			'row-hover-color',
			'nil-type-bg',
			null,
			undefined
		],
		base02: [$$props.colors['--base02'], 'text-selection-background'],
		base03: [
			$$props.colors['--base03'],
			'border-color',
			['expand-button'],
			'length color'
		],
		// base04: [props.colors['--base04']],
		base05: [$$props.colors['--base05'], 'foreground / text-color'],
		// base06: [props.colors['--base06']],
		base06: [
			$$props.colors['--base06'],
			'flash on update color',
			base06Preview.flashOnUpdateColor
		],
		// base07: [props.colors['--base07'], 'flash on update color', base07Preview.flashOnUpdateColor],
		base08: [$$props.colors['--base08'], base08Preview],
		base09: [$$props.colors['--base09'], base09Preview],
		base0A: [
			$$props.colors['--base0A'],
			'base0A is the string color',
			{ ['string keys']: '' }
		],
		base0B: [$$props.colors['--base0B'], ...base0BPreview],
		base0C: [$$props.colors['--base0C'], base0CPreview],
		base0D: [$$props.colors['--base0D'], base0DPreview],
		base0E: [$$props.colors['--base0E'], base0EPreview],
		// base0F: [props.colors['--base0F']],
		previewBrackets,
		functionBodyPreview
	}));

	$.user_pre_effect(() => {
		document.body.dataset['attributecolor'] = $$props.colors['--base0B'];
	});

	let customComponents = {
		string: addComponent(HexString, () => ({ showString: true }), (props) => props.value.startsWith('#'))
	};

	let expandPaths = ['base08.1', 'base09', 'base0C.1', 'base0D.1', 'base0E.1'];
	var div = root();
	var div_1 = $.child(div);
	let styles;
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $$props.style + 'position: absolute;');

		$.component(node, () => Inspect.Panel, ($$anchor, Inspect_Panel) => {
			Inspect_Panel($$anchor, {
				theme: '',
				persist: { storage: 'session', key: 'siv.theming-panel' },
				align: 'full bottom',
				get customComponents() {
					return customComponents;
				},

				get values() {
					return $.get(theming);
				},
				showLength: true,
				showTypes: true,
				expandLevel: 0,
				heading: 'theme preview',
				get expandPaths() {
					return expandPaths;
				},
				previewDepth: Infinity,
				previewEntries: 10,
				get style() {
					return $.get($0);
				},
				open: true,
				parseJson: true,
				get borderless() {
					return $$props.borderless;
				},
				wiggleOnUpdate: false
			});
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	let styles_1;
	var node_1 = $.child(div_2);

	Inspect(node_1, $.spread_props(() => props, {
		get customComponents() {
			return customComponents;
		},

		get values() {
			return $.get(theming);
		},
		showLength: true,
		showTypes: true,
		expandLevel: 0,
		heading: 'theme preview',
		get expandPaths() {
			return expandPaths;
		},
		previewDepth: Infinity,
		previewEntries: 10,
		get style() {
			return $$props.style;
		},
		parseJson: true,
		get borderless() {
			return $$props.borderless;
		}
	}));

	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		styles = $.set_style(div_1, '', styles, { display: $$props.panel ? 'contents' : 'none' });
		styles_1 = $.set_style(div_2, '', styles_1, { display: $$props.panel ? 'none' : 'contents' });
	});

	$.append($$anchor, div);
	$.pop();
}