import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteURL } from 'svelte/reactivity';

var root = $.from_html(`<div> </div> <div> </div> <div> </div> <div> </div> <div> </div> <div> </div> <button>update hostname</button> <button>update pathname</button> <button>update search</button> <button>update href</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let url = new SvelteURL('https://svelte.dev/repl/hello-world?version=5.0');
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2);
	var div_3 = $.sibling(div_2, 2);
	var text_3 = $.only_child(div_3);
	var div_4 = $.sibling(div_3, 2);
	var text_4 = $.only_child(div_4);
	var div_5 = $.sibling(div_4, 2);
	var text_5 = $.only_child(div_5);
	var button = $.sibling(div_5, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, `href: ${url.href ?? ''}`);
			$.set_text(text_1, `host: ${url.host ?? ''}`);
			$.set_text(text_2, `pathname: ${url.pathname ?? ''}`);
			$.set_text(text_3, `search: ${url.search ?? ''}`);
			$.set_text(text_4, `version: ${$0 ?? ''}`);
			$.set_text(text_5, `t: ${$1 ?? ''}`);
		},
		[
			() => url.searchParams.get('version'),
			() => url.searchParams.get('t')
		]
	);

	$.delegated('click', button, () => {
		url.hostname = 'kit.svelte.dev';
	});

	$.delegated('click', button_1, () => {
		url.pathname = 'docs/introduction';
	});

	$.delegated('click', button_2, () => {
		url.search = '?t=123';
	});

	$.delegated('click', button_3, () => {
		url.href = 'https://google.com/search?version=3';
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);