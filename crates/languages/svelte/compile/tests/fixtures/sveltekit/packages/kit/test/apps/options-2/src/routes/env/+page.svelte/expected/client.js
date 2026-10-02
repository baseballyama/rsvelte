import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/env';
import { MESSAGE } from '$app/env/public';

var root = $.from_html(`<p data-testid="public"> </p> <p data-testid="browser"> </p> <p data-testid="private-dynamic"> </p> <p data-testid="private-static"> </p> <p data-testid="private-validated-default"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	var /** @type {import('./$types').PageProps} */
	p = $.first_child(fragment);

	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3);
	var p_4 = $.sibling(p_3, 2);
	var text_4 = $.only_child(p_4);

	$.template_effect(() => {
		$.set_text(text, `public: ${MESSAGE ?? ''}`);
		$.set_text(text_1, `browser: ${browser ?? ''}`);
		$.set_text(text_2, `private dynamic: ${$$props.data.private_dynamic ?? ''}`);
		$.set_text(text_3, `private static: ${$$props.data.private_static ?? ''}`);
		$.set_text(text_4, `private validated default: ${$$props.data.private_validated_default ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
}