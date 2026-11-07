import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { on } from 'svelte/events';
import Wrapper from './wrapper.svelte';

var root = $.from_html(`<div><button>button</button></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function handleParentKeyDown() {
		console.log('parent keydown');
	}

	function keydownOne(node) {
		on(node, 'keydown', (e) => console.log('one'));
	}

	function keydownTwo(node) {
		on(node, 'keydown', (e) => console.log('two'));
	}

	function keydownThree(node) {
		on(node, 'keydown', (e) => console.log('three'));
	}

	Wrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var button = $.child(div);

			$.action(button, ($$node) => keydownOne?.($$node));
			$.action(button, ($$node) => keydownTwo?.($$node));
			$.action(button, ($$node) => keydownThree?.($$node));
			$.reset(div);
			$.delegated('keydown', div, handleParentKeyDown);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['keydown']);