import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Validity from './_Validity.svelte';
import Objects from './_Objects.svelte';
import Autocomplete from './_Autocomplete.svelte';
import AutocompleteObjects from './_AutocompleteObjects.svelte';
import Async from './_Async.svelte';
import AddChipKeys from './_AddChipKeys.svelte';
import Disabled from './_Disabled.svelte';
import SvgRemoveIcons from './_SvgRemoveIcons.svelte';

var root = $.from_html(`<section><h2>Chip Input</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui-extra/chip-input</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('smi2sm', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Chip Input - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'chip-input/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Validity;
		},
		file: 'chip-input/_Validity.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Validity state');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_1 = $.text('Objects allow you to have duplicate entries.');

			$.append($$anchor, text_1);
		};

		Demo(node_2, {
			get component() {
				return Objects;
			},
			file: 'chip-input/_Objects.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Objects');

				$.append($$anchor, text_2);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Autocomplete;
		},
		file: 'chip-input/_Autocomplete.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Autocomplete');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return AutocompleteObjects;
		},
		file: 'chip-input/_AutocompleteObjects.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Autocomplete objects');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_5 = $.text('The autocomplete in the chip input supports retrieving results\n      asynchronously, like from a REST endpoint. Try typing a letter in the box\n      below.');

			$.append($$anchor, text_5);
		};

		Demo(node_5, {
			get component() {
				return Async;
			},
			file: 'chip-input/_Async.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_6 = $.text('Async options loading');

				$.append($$anchor, text_6);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_7 = $.text('You can control which keys add the current chip. This one uses space,\n      comma, dash, and plus.');

			$.append($$anchor, text_7);
		};

		Demo(node_6, {
			get component() {
				return AddChipKeys;
			},
			file: 'chip-input/_AddChipKeys.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_8 = $.text('Add chip keys');

				$.append($$anchor, text_8);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_7 = $.sibling(node_6, 2);

	Demo(node_7, {
		get component() {
			return Disabled;
		},
		file: 'chip-input/_Disabled.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Disabled');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Demo(node_8, {
		get component() {
			return SvgRemoveIcons;
		},
		file: 'chip-input/_SvgRemoveIcons.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('SVG remove icons');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}