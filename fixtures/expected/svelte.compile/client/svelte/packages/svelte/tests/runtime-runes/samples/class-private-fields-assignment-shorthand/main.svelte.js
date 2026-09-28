import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>inc</button> <!> <!> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#a = $.state();
		#b = $.state($.proxy({ val: -1 }));
		#c = $.state();

		constructor() {
			this.#a.v || $.set(this.#a, { val: 0 }, true);
			this.#b.v && $.set(this.#b, { val: 0 }, true);
			this.#c.v ?? $.set(this.#c, { val: 0 }, true);
		}

		inc() {
			$.get(this.#a).val += 1;
			$.get(this.#b).val += 2;
			$.get(this.#c).val += 3;
		}

		get a() {
			return $.get(this.#a)?.val;
		}

		get b() {
			return $.get(this.#b)?.val;
		}

		get c() {
			return $.get(this.#c)?.val;
		}
	}

	let counter = new Counter();
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.key(node, () => 1, ($$anchor) => {
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `a:${counter.a ?? ''}`));
		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	$.key(node_1, () => 2, ($$anchor) => {
		var p_1 = root();
		var text_1 = $.only_child(p_1);

		$.template_effect(() => $.set_text(text_1, `b:${counter.b ?? ''}`));
		$.append($$anchor, p_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.key(node_2, () => 3, ($$anchor) => {
		var p_2 = root();
		var text_2 = $.only_child(p_2);

		$.template_effect(() => $.set_text(text_2, `c:${counter.c ?? ''}`));
		$.append($$anchor, p_2);
	});

	$.delegated('click', button, () => counter.inc());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);