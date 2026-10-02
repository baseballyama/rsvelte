import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { Checkbox } from "$lib/components/ui/checkbox";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Separator } from "$lib/components/ui/separator";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Eye from "@lucide/svelte/icons/eye";
import EyeOff from "@lucide/svelte/icons/eye-off";
import Lock from "@lucide/svelte/icons/lock";
import Mail from "@lucide/svelte/icons/mail";
import GoogleIcon from "./google-icon.svelte";
import LogoIcon from "./logo-icon.svelte";

var root = $.from_html(`<!> Sign in with Google`, 1);
var root_1 = $.from_html(`Sign in <!>`, 1);
var root_2 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><div class="mx-auto w-full max-w-xs space-y-6"><div class="space-y-2 text-center"><!> <h1 class="text-3xl font-semibold">Welcome back</h1> <p class="text-muted-foreground">Sign in to access to your dashboard, settings and projects.</p></div> <div class="space-y-5"><!> <div class="flex items-center gap-2"><!> <span class="text-sm text-muted-foreground">or sign in with email</span> <!></div> <div class="space-y-6"><div><!> <div class="relative mt-2.5"><!> <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50"><!></div></div></div> <div><div class="flex items-center justify-between"><!> <a href="/" class="text-sm text-primary hover:underline">Forgot Password?</a></div> <div class="relative mt-2.5"><!> <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50"><!></div> <button class="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" type="button" aria-controls="password"><!></button></div></div> <div class="flex items-center gap-2 pt-1"><!> <!></div></div> <!> <div class="text-center text-sm"> <a href="/" class="font-medium text-primary hover:underline">Create an account</a></div></div></div></div>`);

export default function Login_07($$anchor) {
	let isVisible = $.state(false);

	const toggleVisibility = () => {
		$.set(isVisible, !$.get(isVisible));
	};

	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	LogoIcon(node, { class: 'mx-auto h-16 w-16' });
	$.next(4);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	Button(node_1, {
		variant: 'outline',
		class: 'w-full justify-center gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			GoogleIcon(node_2, { class: 'h-4 w-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_4 = $.sibling(node_1, 2);
	var node_3 = $.child(div_4);

	Separator(node_3, { class: 'flex-1' });

	var node_4 = $.sibling(node_3, 4);

	Separator(node_4, { class: 'flex-1' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.child(div_5);
	var node_5 = $.child(div_6);

	Label(node_5, {
		for: 'email',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_7 = $.sibling(node_5, 2);
	var node_6 = $.child(div_7);

	Input(node_6, {
		id: 'email',
		class: 'peer ps-9',
		placeholder: 'ephraim@blocks.so',
		type: 'email'
	});

	var div_8 = $.sibling(node_6, 2);
	var node_7 = $.child(div_8);

	Mail(node_7, { size: 16, 'aria-hidden': 'true' });
	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_6);

	var div_9 = $.sibling(div_6, 2);
	var div_10 = $.child(div_9);
	var node_8 = $.child(div_10);

	Label(node_8, {
		for: 'password',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Password');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_9 = $.child(div_11);

	{
		let $0 = $.derived(() => $.get(isVisible) ? "text" : "password");

		Input(node_9, {
			id: 'password',
			class: 'ps-9 pe-9',
			placeholder: 'Enter your password',
			get type() {
				return $.get($0);
			}
		});
	}

	var div_12 = $.sibling(node_9, 2);
	var node_10 = $.child(div_12);

	Lock(node_10, { size: 16, 'aria-hidden': 'true' });
	$.reset(div_12);

	var button = $.sibling(div_12, 2);
	var node_11 = $.child(button);

	{
		var consequent = ($$anchor) => {
			EyeOff($$anchor, { size: 16, 'aria-hidden': 'true' });
		};

		var alternate = ($$anchor) => {
			Eye($$anchor, { size: 16, 'aria-hidden': 'true' });
		};

		$.if(node_11, ($$render) => {
			if ($.get(isVisible)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_11);
	$.reset(div_9);

	var div_13 = $.sibling(div_9, 2);
	var node_12 = $.child(div_13);

	Checkbox(node_12, { id: 'remember-me' });

	var node_13 = $.sibling(node_12, 2);

	Label(node_13, {
		for: 'remember-me',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Remember for 30 days');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_13);
	$.reset(div_5);

	var node_14 = $.sibling(div_5, 2);

	Button(node_14, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_3 = root_1();
			var node_15 = $.sibling($.first_child(fragment_3));

			ArrowRight(node_15, { class: 'h-4 w-4' });
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var div_14 = $.sibling(node_14, 2);
	var text_3 = $.child(div_14);

	text_3.nodeValue = 'No account?  ';
	$.next();
	$.reset(div_14);
	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', $.get(isVisible) ? "Hide password" : "Show password");
		$.set_attribute(button, 'aria-pressed', $.get(isVisible));
	});

	$.delegated('click', button, toggleVisibility);
	$.append($$anchor, div);
}

$.delegate(['click']);