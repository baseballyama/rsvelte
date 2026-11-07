import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import DefaultFocus from './_DefaultFocus.svelte';
import Event from './_Event.svelte';
import Mandatory from './_Mandatory.svelte';
import List from './_List.svelte';
import Selection from './_Selection.svelte';
import Sliders from './_Sliders.svelte';
import NonCloseButton from './_NonCloseButton.svelte';
import LargeScroll from './_LargeScroll.svelte';
import Fullscreen from './_Fullscreen.svelte';
import OverFullscreen from './_OverFullscreen.svelte';
import Sheet from './_Sheet.svelte';
import ManyActions from './_ManyActions.svelte';

var root = $.from_html(`<section><h2>Dialogs</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/dialog</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('w70x89', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Dialogs - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'dialog/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return DefaultFocus;
		},
		file: 'dialog/_DefaultFocus.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default, initially focused button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Event;
		},
		file: 'dialog/_Event.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Using dialog events instead of button clicks');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Mandatory;
		},
		file: 'dialog/_Mandatory.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Mandatory dialog (won\'t close on scrim click or Esc key)');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return List;
		},
		file: 'dialog/_List.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('No actions, and a very long selection list dialog');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Selection;
		},
		file: 'dialog/_Selection.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Selection dialog');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return Sliders;
		},
		file: 'dialog/_Sliders.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Dialog with sliders');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Demo(node_7, {
		get component() {
			return NonCloseButton;
		},
		file: 'dialog/_NonCloseButton.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Dialog with button that doesn\'t close');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Demo(node_8, {
		get component() {
			return LargeScroll;
		},
		file: 'dialog/_LargeScroll.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Large, scrollable dialog');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_8 = $.text('Note that dialogs will only be fullscreen on mobile sized screens. On\n      desktop sized screens, it will be shown as a modal dialog.');

			$.append($$anchor, text_8);
		};

		Demo(node_9, {
			get component() {
				return Fullscreen;
			},
			file: 'dialog/_Fullscreen.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_9 = $.text('Fullscreen dialog');

				$.append($$anchor, text_9);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_10 = $.sibling(node_9, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_10 = $.text('Note that the Material Spec states that the only time a dialog should be\n      placed on top of another dialog is a confirmation dialog showing on top of\n      a fullscreen dialog.');

			$.append($$anchor, text_10);
		};

		Demo(node_10, {
			get component() {
				return OverFullscreen;
			},
			file: 'dialog/_OverFullscreen.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_11 = $.text('Dialog over fullscreen dialog');

				$.append($$anchor, text_11);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_11 = $.sibling(node_10, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_12 = $.text('Floating sheets are dialogs with a close icon button. Having the close\n      icon button is mutually exclusive with having action bar buttons (e.g.\n      cancel and OK buttons). The icon button is absolutely positioned.');

			$.append($$anchor, text_12);
		};

		Demo(node_11, {
			get component() {
				return Sheet;
			},
			file: 'dialog/_Sheet.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_13 = $.text('Floating sheet dialog');

				$.append($$anchor, text_13);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_12 = $.sibling(node_11, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_14 = $.text('Actions buttons will stack automatically if the dialog is too narrow. If\n      you want them to stack regardless, you can force it.');

			$.append($$anchor, text_14);
		};

		Demo(node_12, {
			get component() {
				return ManyActions;
			},
			file: 'dialog/_ManyActions.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_15 = $.text('Too many action buttons for one line');

				$.append($$anchor, text_15);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}