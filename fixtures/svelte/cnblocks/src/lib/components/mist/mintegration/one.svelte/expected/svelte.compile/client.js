import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Gemini from "../mlogos/Gemini.svelte";
import GooglePaLM from "../mlogos/GooglePaLM.svelte";
import Replit from "../mlogos/Replit.svelte";
import MediaWiki from "../mlogos/MediaWiki.svelte";
import MagicUI from "../mlogos/MagicUI.svelte";
import VSCodium from "../mlogos/VSCodium.svelte";

var root = $.from_html(`<section><div class="mx-auto max-w-5xl px-6 py-8"><div class="flex flex-wrap items-center gap-4"><p class="font-medium text-muted-foreground">Integrate with :</p> <div class="flex max-w-2xs flex-wrap gap-3 divide-x *:pr-3"><div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div></div></div></div></section>`);

export default function One($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Gemini(node, { class: 'm-auto size-5' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	GooglePaLM(node_1, { class: 'm-auto size-5' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Replit(node_2, { class: 'm-auto size-5' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_3 = $.child(div_6);

	MediaWiki(node_3, { class: 'm-auto size-5' });
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_4 = $.child(div_7);

	MagicUI(node_4, { class: 'm-auto size-5' });
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_5 = $.child(div_8);

	VSCodium(node_5, { class: 'm-auto size-5' });
	$.reset(div_8);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}