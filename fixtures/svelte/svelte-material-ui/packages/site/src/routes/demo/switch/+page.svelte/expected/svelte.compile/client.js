import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Group from './_Group.svelte';
import NoIcons from './_NoIcons.svelte';
import Events from './_Events.svelte';
import Colored from './_Colored.svelte';

var root = $.from_html(`Think about your <a href="https://developer.chrome.com/blog/new-in-devtools-83/#vision-deficiencies" target="_blank">color</a> <a href="https://developer.mozilla.org/en-US/docs/Tools/Accessibility_inspector/Simulation" target="_blank">blind</a> users before you choose this.`, 1);
var root_1 = $.from_html(`<section><h2>Switch</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/switch</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root_1();

	$.head('6xow65', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Switch - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'switch/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return SecondaryColor;
		},
		file: 'switch/_SecondaryColor.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Secondary color');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Group;
		},
		file: 'switch/_Group.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Group switch');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var fragment = root();

			$.next(4);
			$.append($$anchor, fragment);
		};

		Demo(node_3, {
			get component() {
				return NoIcons;
			},
			file: 'switch/_NoIcons.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('No icons');

				$.append($$anchor, text_2);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Events;
		},
		file: 'switch/_Events.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Events');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Colored;
		},
		files: ['switch/_Colored.svelte', 'switch/_Colored.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Colored (using Sass mixins)');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}