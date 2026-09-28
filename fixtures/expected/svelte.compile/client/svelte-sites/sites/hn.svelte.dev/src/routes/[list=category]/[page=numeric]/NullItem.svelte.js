import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<article class="svelte-16n4ane"><h2 class="svelte-16n4ane"> </h2> <p class="svelte-16n4ane">API failed to return this item - maybe deleted?</p> <span class="index svelte-16n4ane"> </span></article>`);

export default function NullItem($$anchor, $$props) {
	var article = root();
	var h2 = $.child(article);
	var text = $.only_child(h2);
	var span = $.sibling(h2, 4);
	var text_1 = $.only_child(span, true);

	$.reset(article);

	$.template_effect(() => {
		$.set_text(text, `Item #${$$props.id ?? ''} Unavailable`);
		$.set_text(text_1, $$props.index);
	});

	$.append($$anchor, article);
}