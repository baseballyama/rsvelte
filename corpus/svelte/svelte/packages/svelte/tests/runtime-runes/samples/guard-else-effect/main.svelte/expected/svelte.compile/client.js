import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<button>Trigger</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let b = $.state(false);
	let v = $.state("two");

	$.user_effect(() => {
		$.set(v, $.get(b) ? "one" : "two", true);
	});

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			div.textContent = `if1 matched! ${console.log('one') ?? ''}`;
			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			var div_1 = root();

			div_1.textContent = `if2 matched! ${console.log('two') ?? ''}`;
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root();

			div_2.textContent = `nothing matched ${console.log('else') ?? ''}`;
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(v) === "one") $$render(consequent); else if ($.get(v) === "two") $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.delegated('click', button, () => $.set(b, !$.get(b)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);