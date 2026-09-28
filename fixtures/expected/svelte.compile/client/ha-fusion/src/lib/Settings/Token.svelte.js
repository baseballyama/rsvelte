import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { configuration, lang } from '$lib/Stores';

var root = $.from_html(`<h2> </h2> <p class="overflow svelte-10okbuk"> <a target="blank" class="svelte-10okbuk"></a></p> <input class="input" type="password" name="token"/>`, 1);

export default function Token($$anchor, $$props) {
	$.push($$props, true);

	const $configuration = () => $.store_get(configuration, '$configuration', $$stores);
	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let token = $configuration()?.token;

	function handleFocus(event) {
		const target = event.target;

		target.type = event.type === 'focus' ? 'text' : 'password';
	}

	const href = 'https://www.home-assistant.io/docs/authentication/#your-account-profile';
	var fragment = root();
	var h2 = $.first_child(fragment);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.child(p);
	var a = $.sibling(text_1);

	$.set_attribute(a, 'href', href);
	a.textContent = 'https://www.home-assistant.io/docs/authentication/#your-account-profile';
	$.reset(p);

	var input = $.sibling(p, 2);

	$.remove_input_defaults(input);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, $0);
			$.set_text(text_1, `${$1 ?? ''} - `);
			$.set_attribute(input, 'placeholder', $2);
		},
		[
			() => $lang()('token'),
			() => $lang()('docs'),
			() => $lang()('token')
		]
	);

	$.bind_value(input, () => token, ($$value) => token = $$value);
	$.event('focus', input, handleFocus);
	$.event('blur', input, handleFocus);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}