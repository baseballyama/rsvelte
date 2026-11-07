import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ul class="grid-box common-section" style="--grid-item-size:25rem;" data-private=""><!></ul>`);

export default function Tiles($$anchor, $$props) {
	var ul = root();
	var node = $.child(ul);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(ul);
	$.append($$anchor, ul);
}