import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './child.svelte';

var root = $.from_html(`<button>Set data</button> <button>Clear data</button> <!>`, 1);

export default function Main($$anchor) {
	let data = $.state($.proxy({ value: 'hello' }));
	const setData = () => $.set(data, { value: 'hello' }, true);
	const clearData = () => $.set(data, undefined);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			Child($$anchor, {
				get data() {
					return $.get(data);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(data)) $$render(consequent);
		});
	}

	$.delegated('click', button, setData);
	$.delegated('click', button_1, clearData);
	$.append($$anchor, fragment);
}

$.delegate(['click']);