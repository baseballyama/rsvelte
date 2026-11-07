import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';

var root = $.from_html(`<div class="svelte-1b4pumk"><!></div>`);

export default function Broken($$anchor) {
	var div = root();
	var node = $.child(div);

	Icon(node, { icon: 'ph:image-broken-duotone', width: '2.5rem' });
	$.reset(div);
	$.append($$anchor, div);
}