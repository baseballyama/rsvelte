import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';
import Teardown from './Teardown.svelte';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<button>click</button> <!> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Test {
		#originalIds = $.state([1, 2, 3]);

		get originalIds() {
			return $.get(this.#originalIds);
		}

		set originalIds(value) {
			$.set(this.#originalIds, value);
		}

		#ids = $.derived(() => new SvelteSet(this.originalIds));

		get ids() {
			return $.get(this.#ids);
		}

		set ids(value) {
			$.set(this.#ids, value);
		}
	}

	let show = $.state(true);
	const test = new Test();

	function callback() {
		test.ids.delete(2);
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Teardown($$anchor, { callback });
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => test.ids, $.index, ($$anchor, id) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(() => $.set_text(text, $.get(id)));
		$.append($$anchor, div);
	});

	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);