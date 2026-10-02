import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { customJs, lang } from '$lib/Stores';
import Toggle from '$lib/Components/Toggle.svelte';

var root = $.from_html(`<div class="container svelte-17atuhh"><div><h2> </h2> <p class="svelte-17atuhh"><code class="svelte-17atuhh">/data/custom_javascript.js</code></p></div> <div><!></div> <input type="hidden" name="custom_js"/></div>`);

export default function CustomJs($$anchor, $$props) {
	$.push($$props, true);

	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const $customJs = () => $.store_get(customJs, '$customJs', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var div = root();
	var div_1 = $.child(div);
	var h2 = $.child(div_1);
	var text = $.only_child(h2, true);

	$.next(2);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, '', {}, { 'margin-top': '1.3rem' });

	var node = $.child(div_2);

	Toggle(node, {
		get checked() {
			$.mark_store_binding();

			return $customJs();
		},

		set checked($$value) {
			$.store_set(customJs, $$value);
		}
	});

	$.reset(div_2);

	var input = $.sibling(div_2, 2);

	$.remove_input_defaults(input);
	$.reset(div);
	$.template_effect(($0) => $.set_text(text, $0), [() => $lang()('javascript_module')]);
	$.bind_value(input, $customJs, ($$value) => $.store_set(customJs, $$value));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}