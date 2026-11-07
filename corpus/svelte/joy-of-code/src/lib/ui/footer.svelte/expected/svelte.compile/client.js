import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Bluesky, Mail, RSS, X, YouTube } from '$lib/icons';
import * as config from '$lib/site/config';

var root = $.from_html(`<footer class="svelte-5aznnr"><div class="follow"><p class="svelte-5aznnr">Follow</p> <ul class="svelte-5aznnr"><li class="svelte-5aznnr"><a href="/newsletter" class="svelte-5aznnr"><!> <span>Newsletter</span></a></li> <li class="svelte-5aznnr"><a target="_blank" rel="noreferrer" class="svelte-5aznnr"><!> <span>YouTube</span></a></li> <li class="svelte-5aznnr"><a target="_blank" rel="noreferrer" class="svelte-5aznnr"><!> <span>Twitter</span></a></li> <li class="svelte-5aznnr"><a target="_blank" rel="noreferrer" class="svelte-5aznnr"><!> <span>Bluesky</span></a></li> <li class="svelte-5aznnr"><a href="/rss.xml" target="_blank" class="svelte-5aznnr"><!> <span>RSS</span></a></li></ul></div> <div class="other"><p class="svelte-5aznnr">Other</p> <ul class="svelte-5aznnr"><li class="svelte-5aznnr"><a href="/about" class="svelte-5aznnr">About</a></li> <li class="svelte-5aznnr"><a target="_blank" rel="noreferrer" class="svelte-5aznnr">Uses</a></li></ul></div></footer>`);

export default function Footer($$anchor, $$props) {
	$.push($$props, true);

	var footer = root();
	var div = $.child(footer);
	var ul = $.sibling($.child(div), 2);
	var li = $.child(ul);
	var a = $.child(li);
	var node = $.child(a);

	Mail(node, { width: 20, height: 20, 'aria-hidden': true });
	$.next(2);
	$.reset(a);
	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var a_1 = $.child(li_1);
	var node_1 = $.child(a_1);

	YouTube(node_1, { width: 20, height: 20, 'aria-hidden': true });
	$.next(2);
	$.reset(a_1);
	$.reset(li_1);

	var li_2 = $.sibling(li_1, 2);
	var a_2 = $.child(li_2);
	var node_2 = $.child(a_2);

	X(node_2, { width: 20, height: 20, 'aria-hidden': true });
	$.next(2);
	$.reset(a_2);
	$.reset(li_2);

	var li_3 = $.sibling(li_2, 2);
	var a_3 = $.child(li_3);
	var node_3 = $.child(a_3);

	Bluesky(node_3, { width: 20, height: 20, 'aria-hidden': true });
	$.next(2);
	$.reset(a_3);
	$.reset(li_3);

	var li_4 = $.sibling(li_3, 2);
	var a_4 = $.child(li_4);
	var node_4 = $.child(a_4);

	RSS(node_4, { width: 20, height: 20, 'aria-hidden': true });
	$.next(2);
	$.reset(a_4);
	$.reset(li_4);
	$.reset(ul);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var ul_1 = $.sibling($.child(div_1), 2);
	var li_5 = $.sibling($.child(ul_1), 2);
	var a_5 = $.only_child(li_5);

	$.reset(ul_1);
	$.reset(div_1);
	$.reset(footer);

	$.template_effect(() => {
		$.set_attribute(a_1, 'href', config.youtube);
		$.set_attribute(a_2, 'href', config.twitter);
		$.set_attribute(a_3, 'href', config.bluesky);
		$.set_attribute(a_5, 'href', config.uses);
	});

	$.append($$anchor, footer);
	$.pop();
}