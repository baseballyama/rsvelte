import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>v is true</p>`);
var root_1 = $.from_html(`<button>toggle outer</button> <button>toggle inner</button> <button>reset</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(false);

	const fn = () => {
		if ($.effect_tracking()) {
			$.user_effect(() => {
				$.set(value, true);
			});
		}

		return $.get(value);
	};

	let outer = $.state(false);
	let inner = $.state(false);
	let v = $.derived(() => $.get(inner) ? fn() : false);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var node = $.sibling(button_2, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(outer) && $.get(v)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(outer, !$.get(outer)));
	$.delegated('click', button_1, () => $.set(inner, !$.get(inner)));
	$.delegated('click', button_2, () => $.set(outer, $.set(inner, $.set(value, false), true), true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);