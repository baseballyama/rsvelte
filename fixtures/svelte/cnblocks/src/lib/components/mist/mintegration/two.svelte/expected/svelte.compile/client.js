import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Gemini from "../mlogos/Gemini.svelte";
import GooglePaLM from "../mlogos/GooglePaLM.svelte";
import Replit from "../mlogos/Replit.svelte";
import MediaWiki from "../mlogos/MediaWiki.svelte";
import MagicUI from "../mlogos/MagicUI.svelte";
import VSCodium from "../mlogos/VSCodium.svelte";
import Button from "$lib/components/ui/button/button.svelte";

var root = $.from_html(`<section><div class="mx-auto max-w-5xl px-6 py-8"><div class="space-y-6 text-center"><h2 class="text-2xl font-semibold text-foreground">Integrate with your favorite tools :</h2> <div class="mx-auto flex max-w-xl flex-wrap justify-center gap-0.5 *:rounded *:bg-foreground/5 *:p-6 *:first:rounded-l-xl *:last:rounded-r-xl"><div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div></div> <!></div></div></section>`);

export default function Two($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Gemini(node, { class: 'm-auto size-8' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	GooglePaLM(node_1, { class: 'm-auto size-8' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Replit(node_2, { class: 'm-auto size-8' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_3 = $.child(div_6);

	MediaWiki(node_3, { class: 'm-auto size-8' });
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_4 = $.child(div_7);

	MagicUI(node_4, { class: 'm-auto size-8' });
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_5 = $.child(div_8);

	VSCodium(node_5, { class: 'm-auto size-8' });
	$.reset(div_8);
	$.reset(div_2);

	var node_6 = $.sibling(div_2, 2);

	Button(node_6, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('More Integrations');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}