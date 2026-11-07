import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { _ } from 'svelte-i18n';

var root = $.from_html(`<h1> </h1>`);

export default function Ts_i18n_input($$anchor, $$props) {
	$.push($$props, true);

	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => _('page.home.title')]);
	$.append($$anchor, h1);
	$.pop();
}