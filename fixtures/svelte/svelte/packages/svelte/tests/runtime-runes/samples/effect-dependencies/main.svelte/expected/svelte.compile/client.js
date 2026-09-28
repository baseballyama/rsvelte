import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

class Things {
	#tab = $.state('A');

	get tab() {
		return $.get(this.#tab);
	}

	set tab(value) {
		$.set(this.#tab, value, true);
	}

	#data = $.state($.proxy([{ no: 1 }, { no: 2 }]));

	get data() {
		return $.get(this.#data);
	}

	set data(value) {
		$.set(this.#data, value, true);
	}

	#list = $.derived(() => this.filter());

	get list() {
		return $.get(this.#list);
	}

	set list(value) {
		$.set(this.#list, value);
	}

	filter() {
		this.tab;

		return this.data;
	}
}

const things = new Things();
var root = $.from_html(`B <!>`, 1);
var root_1 = $.from_html(`<div><button>A</button> <button>B</button></div> <div><!></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var text = $.text('A');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			$.each(node_1, 17, () => things.list, $.index, ($$anchor, item) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(item).no));
				$.append($$anchor, text_1);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (things.tab === 'A') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.delegated('click', button, () => things.tab = 'A');
	$.delegated('click', button_1, () => things.tab = 'B');
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);