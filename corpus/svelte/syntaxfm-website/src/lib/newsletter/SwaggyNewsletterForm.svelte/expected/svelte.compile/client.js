import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/forms/Input.svelte';
import swag from './swag.png';

var root = $.from_html(`<div class="newsletter-layout card svelte-zha2zy"><h5 class="h6 svelte-zha2zy">15% off your swag order</h5> <img alt="Syntax Swag Photos" class="svelte-zha2zy"/> <p class="svelte-zha2zy">Subscribe to the Syntax<br/><a href="/snackpack" class="svelte-zha2zy">Snack Pack Newsletter</a></p> <form method="post" data-uid="05d939b74d" class="center readable" target="_blank" aria-labelledby="newsletter-form-label"><div class="newsletter svelte-zha2zy"><!> <button class="black small" type="submit">Subscribe</button></div></form></div>`);

export default function SwaggyNewsletterForm($$anchor, $$props) {
	$.push($$props, true);

	let is_hidden = $.state(false);
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var img = $.sibling($.child(div), 2);
			var form = $.sibling(img, 4);

			$.set_attribute(form, 'action', $.get(action));
			$.set_attribute(form, 'data-sv-form', FORM_ID);

			var div_1 = $.child(form);
			var node_1 = $.child(div_1);

			Input(node_1, {
				required: true,
				type: 'email',
				label: 'Email',
				id: 'email_address'
			});

			$.next(2);
			$.reset(div_1);
			$.reset(form);
			$.reset(div);
			$.template_effect(() => $.set_attribute(img, 'src', swag));
			$.event('submit', form, submit);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (!$.get(is_hidden)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}