import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { _ } from './i18n-test-svelte-i18n';

var root = $.from_html(`<main><input/></main>`);

export default function I18n_test_input($$anchor, $$props) {
	$.push($$props, true);

	const $_ = () => $.store_get(_, '$_', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var main = root();
	var input = $.only_child(main);

	$.template_effect(($0) => $.set_attribute(input, 'name', $0), [() => $_()('test')]);
	$.append($$anchor, main);
	$.pop();
	$$cleanup();
}