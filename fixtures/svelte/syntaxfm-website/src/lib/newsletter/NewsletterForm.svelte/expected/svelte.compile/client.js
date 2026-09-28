import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NewsletterLogo from './NewsletterLogo.svelte';
import Input from '$lib/forms/Input.svelte';

var root = $.from_html(`<div class="newsletter-logo-container svelte-13iisdc"><a href="/snackpack"><!></a></div>`);
var root_1 = $.from_html(`<div class="newsletter-layout svelte-13iisdc"><!> <form method="post" data-uid="05d939b74d" class="center readable svelte-13iisdc" target="_blank" aria-labelledby="newsletter-form-label"><h5 class="readable join fst-400-i svelte-13iisdc">Join our newsletter for <strong class="svelte-13iisdc">15% off</strong> all Syntax & Sentry swag</h5> <div class="newsletter svelte-13iisdc"><!> <button type="submit" class="svelte-13iisdc">Subscribe</button></div> <p class="svelte-13iisdc">Hot takes, tips & tricks, new content, swag drops & more</p> <p class="text-sm svelte-13iisdc">Dip at any time.</p></form></div>`);

export default function NewsletterForm($$anchor, $$props) {
	$.push($$props, true);

	let is_hidden = $.state(false);
	let show_logo = $.prop($$props, 'show_logo', 3, true);
	const FORM_ID = 5465361;
	let action = $.derived(() => `https://app.convertkit.com/forms/${FORM_ID}/subscriptions`);

	function submit() {
		document.cookie = 'newsletter_visible=hidden';
	}

	$.user_effect(() => {
		if (typeof document !== 'undefined') {
			$.set(is_hidden, document.cookie.includes('newsletter_visible'), true);
		}
	});

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var a = $.child(div_1);
			var node_1 = $.child(a);

			NewsletterLogo(node_1, {});
			$.reset(a);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (show_logo()) $$render(consequent);
		});
	}

	var form = $.sibling(node, 2);

	$.set_attribute(form, 'action', $.get(action));
	$.set_attribute(form, 'data-sv-form', FORM_ID);

	var div_2 = $.sibling($.child(form), 2);
	var node_2 = $.child(div_2);

	Input(node_2, {
		required: true,
		type: 'email',
		label: 'Email',
		id: 'email_address'
	});

	$.next(2);
	$.reset(div_2);
	$.next(4);
	$.reset(form);
	$.reset(div);
	$.event('submit', form, submit);
	$.append($$anchor, div);
	$.pop();
}