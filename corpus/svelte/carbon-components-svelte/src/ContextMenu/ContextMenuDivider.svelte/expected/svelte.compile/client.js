import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li role="separator"></li>`);

export default function ContextMenuDivider($$anchor) {
	var li = root();

	$.set_class(li, 1, '', null, {}, { 'bx--menu-divider': true });
	$.append($$anchor, li);
}