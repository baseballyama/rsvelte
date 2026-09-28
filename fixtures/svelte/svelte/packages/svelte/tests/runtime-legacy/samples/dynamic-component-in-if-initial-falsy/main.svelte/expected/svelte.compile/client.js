import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';

var root = $.from_html(`<button>toggle component</button> <button>toggle show</button> <!>`, 1);

export default function Main($$anchor) {
	/** @type {typeof Foo | null} */
	let component = null;

	let show = true;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => component, ($$anchor, $$component) => {
				$$component($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (show) $$render(consequent);
		});
	}

	$.event('click', button, () => component = component ? null : Foo);
	$.event('click', button_1, () => show = !show);
	$.append($$anchor, fragment);
}