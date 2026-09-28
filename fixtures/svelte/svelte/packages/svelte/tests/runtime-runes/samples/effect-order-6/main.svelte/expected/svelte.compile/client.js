import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';

var root = $.from_html(`<button>open</button> <button>close</button> <hr/> <!>`, 1);

export default function Main($$anchor) {
	let object = $.state(void 0);

	function open() {
		$.set(object, { boolean: true }, true);
	}

	function close() {
		$.set(object, undefined);
	}

	let closed = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 4);

	{
		var consequent = ($$anchor) => {
			A($$anchor, {
				get closed() {
					return $.get(closed);
				},
				close,
				get boolean() {
					return $.get(object).boolean;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(object)) $$render(consequent);
		});
	}

	$.delegated('click', button, open);
	$.delegated('click', button_1, () => $.set(closed, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);