import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ul><!></ul>`);

export default function HeaderPanelLinks($$anchor, $$props) {
	var ul = root();

	$.set_class(ul, 1, '', null, {}, { 'bx--switcher__item': true });

	var node = $.child(ul);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(ul);
	$.append($$anchor, ul);
}