import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NewsletterForm from '$/lib/newsletter/NewsletterForm.svelte';
import NewsletterLogo from '$lib/newsletter/NewsletterLogo.svelte';
import { format } from 'date-fns';

var root = $.from_html(`<p class="error svelte-15d9tgf">Oopsie daisy! Unable to load past issues.</p>`);
var root_1 = $.from_html(`<li class="svelte-15d9tgf"><a class="svelte-15d9tgf"><small class="text-xs"> </small> <p class="svelte-15d9tgf"> </p></a></li>`);
var root_2 = $.from_html(`<main><div><h1 class="h3 lines" id="newsletter-form-label">Syntax Snack Pack</h1> <p class="center svelte-15d9tgf">Wanna be one of the <strong> </strong> coolest people in the world?</p> <div class="newsletter-logo-container svelte-15d9tgf"><!></div> <!> <div class="center"><h2 class="lines">Past Issues</h2> <p class="readable center svelte-15d9tgf">Wanna see how good our snackpack is? Looking for something mentioned in the past?</p> <!> <ul class="svelte-15d9tgf"></ul></div></div></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var main = root_2();
	var div = $.child(main);
	var p = $.sibling($.child(div), 2);
	var strong = $.sibling($.child(p));
	var text = $.only_child(strong, true);

	$.next();
	$.reset(p);

	var div_1 = $.sibling(p, 2);
	var node = $.child(div_1);

	NewsletterLogo(node, {});
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	NewsletterForm(node_1, { show_logo: false });

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.sibling($.child(div_2), 4);

	{
		var consequent = ($$anchor) => {
			var p_1 = root();

			$.append($$anchor, p_1);
		};

		$.if(node_2, ($$render) => {
			if (!$$props.data.issues.length) $$render(consequent);
		});
	}

	var ul = $.sibling(node_2, 2);

	$.each(ul, 21, () => $$props.data.issues, $.index, ($$anchor, issue) => {
		var li = root_1();
		var a = $.child(li);
		var small = $.child(a);
		var text_1 = $.only_child(small, true);
		var p_2 = $.sibling(small, 2);
		var text_2 = $.only_child(p_2, true);

		$.reset(a);
		$.reset(li);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', `/snackpack/${$.get(issue).id ?? ''}`);
				$.set_text(text_1, $0);
				$.set_text(text_2, $.get(issue).subject);
			},
			[
				() => format(new Date($.get(issue).published_at), 'MMM dd, yyyy')
			]
		);

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_2);
	$.reset(div);
	$.reset(main);
	$.template_effect(() => $.set_text(text, $$props.data.count));
	$.append($$anchor, main);
	$.pop();
}