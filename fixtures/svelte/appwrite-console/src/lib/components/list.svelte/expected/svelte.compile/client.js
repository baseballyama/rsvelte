import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ul class="list"><!></ul>`);

export default function List($$anchor, $$props) {
	var ul = root();

	$.set_style(ul, '', {}, { gap: '0.25rem' });

	var node = $.child(ul);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(ul);
	$.append($$anchor, ul);
}