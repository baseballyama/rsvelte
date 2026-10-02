import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { _ } from 'svelte-i18n';

var root = $.from_html(`<h1> </h1>`);

export default function Ts_i18n_output($$anchor, $$props) {
	$.push($$props, true);

	const $_ = () => $.store_get(_, '$_', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => $_()('page.home.title')]);
	$.append($$anchor, h1);
	$.pop();
	$$cleanup();
}