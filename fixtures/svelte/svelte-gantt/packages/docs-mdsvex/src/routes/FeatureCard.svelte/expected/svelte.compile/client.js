import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="bg-slate-200/40 p-4"><h2 class="text-lg font-medium text-slate-500"><!></h2> <p class="text-slate-400 pt-1"><!></p></div>`);

export default function FeatureCard($$anchor, $$props) {
	var div = root();
	var h2 = $.child(div);
	var node = $.child(h2);

	$.slot(node, $$props, 'title', {}, null);
	$.reset(h2);

	var p = $.sibling(h2, 2);
	var node_1 = $.child(p);

	$.slot(node_1, $$props, 'subtitle', {}, null);
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}