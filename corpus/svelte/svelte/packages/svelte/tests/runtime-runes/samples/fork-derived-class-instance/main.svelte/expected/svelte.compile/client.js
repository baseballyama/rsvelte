import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from 'svelte';

var root = $.from_html(`<button>click</button> <p> </p>`, 1);
var root_1 = $.from_html(`<button>fork</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#count = $.state(0);

		get count() {
			return $.get(this.#count);
		}

		set count(value) {
			$.set(this.#count, value, true);
		}
	}

	let condition = $.state(false);
	let counter = $.derived(() => new Counter());
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var button_1 = $.first_child(fragment_1);
			var p = $.sibling(button_1, 2);
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(counter).count));

			$.delegated('click', button_1, () => {
				$.get(counter).count++;
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(condition)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => {
		fork(() => {
			$.set(condition, true);
		}).commit();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);