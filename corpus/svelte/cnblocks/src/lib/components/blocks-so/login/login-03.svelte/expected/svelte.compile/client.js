import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";

var root = $.from_html(`<div class="flex min-h-screen items-center justify-center"><div class="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6"><div class="sm:mx-auto sm:w-full sm:max-w-sm"><h3 class="text-center text-lg font-semibold text-foreground dark:text-foreground">Welcome Back</h3> <p class="text-center text-sm text-muted-foreground dark:text-muted-foreground">Enter your credentials to access your account.</p> <form action="#" method="post" class="mt-6 space-y-4"><div><!> <!></div> <div><!> <!></div> <!></form> <p class="mt-6 text-sm text-muted-foreground dark:text-muted-foreground"> <a href="/" class="font-medium text-primary hover:text-primary/90 dark:text-primary dark:hover:text-primary/90">Reset password</a></p></div></div></div>`);

export default function Login_03($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var form = $.sibling($.child(div_2), 4);
	var div_3 = $.child(form);
	var node = $.child(div_3);

	Label(node, {
		for: 'email-login-03',
		class: 'text-sm font-medium text-foreground dark:text-foreground',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		type: 'email',
		id: 'email-login-03',
		name: 'email-login-03',
		autocomplete: 'email',
		placeholder: 'ephraim@blocks.so',
		class: 'mt-2'
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	Label(node_2, {
		for: 'password-login-03',
		class: 'text-sm font-medium text-foreground dark:text-foreground',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Password');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Input(node_3, {
		type: 'password',
		id: 'password-login-03',
		name: 'password-login-03',
		autocomplete: 'current-password',
		placeholder: '**************',
		class: 'mt-2'
	});

	$.reset(div_4);

	var node_4 = $.sibling(div_4, 2);

	Button(node_4, {
		type: 'submit',
		class: 'mt-4 w-full py-2 font-medium',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Sign in');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var p = $.sibling(form, 2);
	var text_3 = $.child(p);

	text_3.nodeValue = 'Forgot your password?  ';
	$.next();
	$.reset(p);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}