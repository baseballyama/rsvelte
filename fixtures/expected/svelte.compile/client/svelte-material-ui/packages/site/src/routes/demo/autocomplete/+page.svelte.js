import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Prefilled from './_Prefilled.svelte';
import Combobox from './_Combobox.svelte';
import Objects from './_Objects.svelte';
import AddEntries from './_AddEntries.svelte';
import AddToList from './_AddToList.svelte';
import Async from './_Async.svelte';
import FullWidth from './_FullWidth.svelte';
import CustomDisplay from './_CustomDisplay.svelte';
import Manual from './_Manual.svelte';

var root = $.from_html(`<section class="svelte-l7exe9"><h2 class="svelte-l7exe9">Auto<wbr class="svelte-l7exe9"/>complete</h2> <h5 class="svelte-l7exe9">Installation</h5> <pre class="demo-spaced svelte-l7exe9">npm i -D @smui-extra/autocomplete</pre> <h5 class="svelte-l7exe9">Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('l7exe9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Autocomplete - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'autocomplete/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Prefilled;
		},
		file: 'autocomplete/_Prefilled.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Prefilled value');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_1 = $.text('A combobox lets the user input any text, but provides autocomplete\n      functionality as well.');

			$.append($$anchor, text_1);
		};

		Demo(node_2, {
			get component() {
				return Combobox;
			},
			file: 'autocomplete/_Combobox.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Combobox');

				$.append($$anchor, text_2);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Objects;
		},
		file: 'autocomplete/_Objects.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Objects as options');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return AddEntries;
		},
		file: 'autocomplete/_AddEntries.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Adding entries');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_5 = $.text('Leave the menu open and don\'t fill the textbox upon selection.');

			$.append($$anchor, text_5);
		};

		Demo(node_5, {
			get component() {
				return AddToList;
			},
			file: 'autocomplete/_AddToList.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_6 = $.text('Add entries to a list');

				$.append($$anchor, text_6);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_7 = $.text('Autocomplete supports retrieving results asynchronously, like from a REST\n      endpoint. Try typing a letter in the box below.');

			$.append($$anchor, text_7);
		};

		Demo(node_6, {
			get component() {
				return Async;
			},
			file: 'autocomplete/_Async.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_8 = $.text('Async options loading');

				$.append($$anchor, text_8);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_7 = $.sibling(node_6, 2);

	Demo(node_7, {
		get component() {
			return FullWidth;
		},
		file: 'autocomplete/_FullWidth.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Full width');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Demo(node_8, {
		get component() {
			return CustomDisplay;
		},
		file: 'autocomplete/_CustomDisplay.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Custom item display');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Demo(node_9, {
		get component() {
			return Manual;
		},
		file: 'autocomplete/_Manual.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Manual setup');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}