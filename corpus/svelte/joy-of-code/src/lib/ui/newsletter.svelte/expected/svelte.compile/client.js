import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { Envelope } from '$lib/icons';

var root = $.from_html(`<span class="error svelte-1w81ggn"> </span>`);
var root_1 = $.from_html(`<span class="success svelte-1w81ggn"> </span>`);
var root_2 = $.from_html(`<form class="svelte-1w81ggn"><label for="email" class="sr-only">Enter your email</label> <input type="email" id="email" name="email" placeholder="your@email.com" autocomplete="on" class="svelte-1w81ggn"/> <button type="submit" class="svelte-1w81ggn"><!> <span class="svelte-1w81ggn">Subscribe</span></button></form> <div class="message svelte-1w81ggn"><!> <!></div>`, 1);

export default function Newsletter($$anchor) {
	let email = $.state('');
	let error = $.state('');
	let success = $.state('');

	async function onsubmit(e) {
		e.preventDefault();

		const response = await fetch('/api/subscribe', {
			method: 'post',
			body: JSON.stringify($.get(email)),
			headers: { 'Content-Type': 'application/json' }
		});

		const subscribe = await response.json();

		if (subscribe.error) {
			$.set(success, '');
			$.set(error, subscribe.error, true);
		}

		if (subscribe.success) {
			$.set(error, '');
			$.set(success, subscribe.success, true);
		}
	}

	var fragment = root_2();
	var form = $.first_child(fragment);
	var input = $.sibling($.child(form), 2);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var node = $.child(button);

	Envelope(node, { width: 24, height: 24, 'aria-hidden': true });
	$.next(2);
	$.reset(button);
	$.reset(form);

	var div = $.sibling(form, 2);
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $.get(error)));
			$.transition(1, span, () => fade);
			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if ($.get(error)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span_1 = root_1();
			var text_1 = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(success)));
			$.transition(1, span_1, () => fade);
			$.append($$anchor, span_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(success)) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.event('submit', form, onsubmit);
	$.bind_value(input, () => $.get(email), ($$value) => $.set(email, $$value));
	$.append($$anchor, fragment);
}