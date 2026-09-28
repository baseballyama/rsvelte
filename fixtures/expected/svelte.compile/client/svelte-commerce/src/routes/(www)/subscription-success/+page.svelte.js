import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { MailCheck } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';

var root = $.from_html(`<meta name="robots" content="noindex"/>`);
var root_1 = $.from_html(`Thanks for subscribing! We've sent a confirmation email to <span class="font-semibold text-foreground"> </span>.`, 1);

var root_2 = $.from_html(`<div class="flex min-h-[60vh] w-full items-center justify-center bg-background px-4 py-16"><div class="w-full max-w-lg text-center"><div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50"><!></div> <h1 class="mb-3 text-3xl font-bold tracking-tight text-foreground">Subscription Successful</h1> <p class="mb-2 text-base text-muted-foreground"><!></p> <p class="mb-8 text-sm text-muted-foreground">Please check your inbox and click the link in that email to confirm your email address. If you don't see it within a few
			minutes, check your spam or promotions folder.</p> <!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Set by the footer newsletter form via goto(..., { state: { email } });
	// absent on a direct visit or reload, so the copy falls back to a generic line.
	const email = $.derived(() => page.state?.email);

	var div = root_2();

	$.head('yfbtyd', ($$anchor) => {
		var meta = root();

		$.deferred_template_effect(() => {
			$.document.title = `Subscription Successful — ${(page.data?.store?.name || 'Store') ?? ''}`;
		});

		$.append($$anchor, meta);
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	MailCheck(node, { class: 'h-10 w-10 text-green-600' });
	$.reset(div_2);

	var p = $.sibling(div_2, 4);
	var node_1 = $.child(p);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var span = $.sibling($.first_child(fragment));
			var text = $.only_child(span, true);

			$.next();
			$.template_effect(() => $.set_text(text, $.get(email)));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('Thanks for subscribing! We\'ve sent you a confirmation email.');

			$.append($$anchor, text_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(email)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(p);

	var node_2 = $.sibling(p, 4);

	Button(node_2, {
		href: '/',
		class: 'h-12 px-8',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Continue Shopping');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}