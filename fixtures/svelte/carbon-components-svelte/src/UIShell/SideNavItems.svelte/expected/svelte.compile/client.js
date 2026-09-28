import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ul><!></ul>`);

export default function SideNavItems($$anchor, $$props) {
	var ul = root();

	$.set_class(ul, 1, '', null, {}, { 'bx--side-nav__items': true });

	var node = $.child(ul);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(ul);
	$.append($$anchor, ul);
}