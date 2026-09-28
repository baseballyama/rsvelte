import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

let active = $.state(false);
let panelWidth = $.state(null);

const store = {
	get active() {
		return $.get(active);
	},

	open() {
		$.set(active, true);
	},

	close() {
		$.set(active, false);
	},

	// This getter lazily writes $state on first read
	get panelWidth() {
		if ($.get(panelWidth) === null) $.set(panelWidth, 42);

		$.user_effect(() => {
			console.log('effect ran');
		});

		return $.get(panelWidth);
	}
};

var root = $.from_html(`<button>Open</button> <button>Close</button> <button> </button> <div><!></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let counter = $.state(0);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var text = $.only_child(button_2, true);
	var div = $.sibling(button_2, 2);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `open (width: ${store.panelWidth ?? ''})`));
			$.append($$anchor, text_1);
		};

		var alternate = ($$anchor) => {
			var text_2 = $.text('closed');

			$.append($$anchor, text_2);
		};

		$.if(node, ($$render) => {
			if (store.active) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(counter)));
	$.delegated('click', button, () => store.open());
	$.delegated('click', button_1, () => store.close());
	$.delegated('click', button_2, () => $.update(counter));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);