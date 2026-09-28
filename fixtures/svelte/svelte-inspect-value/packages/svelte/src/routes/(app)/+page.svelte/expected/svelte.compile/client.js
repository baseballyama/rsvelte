import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createPageTitle } from '$doclib/util.js';
import Inspect from '$lib/index.js';
import { untrack } from 'svelte';
import { fly } from 'svelte/transition';

var root = $.from_html(`<div> </div>`);

var root_1 = $.from_html(
	`<div class="center svelte-voieyz"><!> <div class="theme-display svelte-voieyz">theme: <!></div></div> <h2>What it is</h2> <p>Svelte Inspect Value is a collection of "JSON tree"-like value inspector components.<br/> The main purpose of the components is to be a developer utility. When developing apps it can be
  useful to have a "live" preview of state like API data, form values, the state of a promise and so
  on.</p> <h2>Features</h2> <p>The <a href="/reference/examples">examples</a> page is the quickest way to get an overview of what
  this component can do, but here is a list of its key features:</p> <ul><li>Display arrays & objects in a tree-like view</li> <li>Support for most JavaScript built-ins, including <code>Set</code>, <code>Map</code>, <code>Date</code>, <code>URL</code>, promises etc.</li> <li>Inspect current values of svelte stores or Observables</li> <li>Syntax highlighting for functions and html elements (outer selector) using <code>hljs</code></li> <li>Embed media if string ends with image / audio extension (optional)</li> <li>Customizable colors</li> <li>Configurable with global options utility as alternative to passing props</li> <li><a href="/reference/panel">Fixed position</a> drawer / panel component</li></ul>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const alwaysPresent = { theme: 'inspect', borderless: false };

	const configurations = [
		{ theme: 'inspect' },
		{ theme: 'drak' },
		{ theme: 'stereo' },
		{ theme: 'dark' },
		{ theme: 'dark', borderless: true },
		{ theme: 'stereo', borderless: true },
		{ theme: 'drak', borderless: true },
		{ theme: 'inspect', borderless: true }
	];

	const MAX = configurations.length - 1;
	let currentIndex = $.state(0);
	let currentOpts = $.derived(() => ({ ...alwaysPresent, ...configurations[$.get(currentIndex)] }));

	$.user_effect(() => {
		let interval;

		untrack(() => {
			interval = window.setInterval(
				() => {
					if ($.get(currentIndex) === MAX) {
						$.set(currentIndex, 0);
						alwaysPresent.search = true;
					} else {
						$.set(currentIndex, $.get(currentIndex) + 1);
					}
				},
				5000
			);
		});

		return () => {
			window.clearInterval(interval);
		};
	});

	$.user_effect(() => {
		let timeout;

		untrack(() => {
			timeout = window.setTimeout(
				() => {
					alwaysPresent.style = 'rotate: 360deg; transition: rotate 5s linear';
				},
				600000
			);
		});

		return () => {
			window.clearTimeout(timeout);
		};
	});

	var fragment = root_1();

	$.head('voieyz', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('Home')]
		);
	});

	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		let $0 = $.derived(() => ({
			name: 'svelte-inspect-value',
			installCommands: [
				'copy to clipboard 👉',
				'npm install svelte-inspect-value',
				'pnpm add svelte-inspect-value',
				'bun add svelte-inspect-value',
				'yarn add svelte-inspect-value'
			],
			npm: 'https://www.npmjs.com/package/svelte-inspect-value',
			github: 'https://github.com/ampled/svelte-inspect-value',
			docs: 'https://inspect.eirik.space/',
			playground: 'https://svelte.dev/playground/956365d6905c44298234ff4d9c60741e?version=5',
			stats: $$props.data.stats
		}));

		Inspect(node, $.spread_props(
			{
				style: 'max-width: 640px',
				heading: 'packageInfo',
				get values() {
					return $.get($0);
				}
			},
			() => $.get(currentOpts)
		));
	}

	var div_1 = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div_1));

	$.key(node_1, () => $.get(currentOpts).theme, ($$anchor) => {
		var div_2 = root();
		var text = $.only_child(div_2);

		$.template_effect(() => $.set_text(text, `${$.get(currentOpts).theme ?? ''}
        ${$.get(currentOpts).borderless ? '(borderless)' : ''}`));

		$.transition(1, div_2, () => fly, () => ({ y: -10, delay: 450 }));
		$.transition(2, div_2, () => fly, () => ({ y: 10 }));
		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.next(10);
	$.append($$anchor, fragment);
	$.pop();
}