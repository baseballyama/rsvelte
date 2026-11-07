import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setLocale } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages.js';

var root = $.from_html(`<div><button>Hello, this is a test</button><button>Hello, this is a test</button></div>`);
var root_1 = $.from_html(`<button>Hello, this is a test</button><button>Hello, this is a test</button>`, 1);
var root_2 = $.from_html(`<h1> </h1><div><button>en</button><button>es</button></div><p>If you use VSCode, install the <a href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension" target="_blank">Sherlock i18n extension</a>for a better i18n experience.</p> <!> <!> <button class="foo bar" aria-label="click">Click me!</button> <button class="foo bar" aria-label="click"><span>some fancy looking</span><span>really long button text</span></button>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var div = $.sibling(h1);
	var button = $.child(div);
	var button_1 = $.sibling(button);

	$.reset(div);

	var node = $.sibling(div, 3);

	Component(node, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Component(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var button_2 = $.sibling(node_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.template_effect(($0) => $.set_text(text, $0), [() => m.hello_world({ name: 'SvelteKit User' })]);
	$.delegated('click', button, () => setLocale('en'));
	$.delegated('click', button_1, () => setLocale('es'));
	$.delegated('click', button_2, () => console.log("clicked"));
	$.delegated('click', button_3, () => console.log("clicked"));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);