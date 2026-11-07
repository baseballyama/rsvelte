import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Bolt as Logo } from "$lib/svgs/index";
import { Button } from "$lib/components/ui/veil/button";
import { Input } from "$lib/components/ui/veil/input";
import { Label } from "$lib/components/ui/label";

var root = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 256 262"><path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path><path fill="#34a853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path><path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path><path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path></svg> <span>Continue with Google</span>`, 1);
var root_1 = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 256 256"><path fill="currentColor" d="M128 0C57.317 0 0 57.317 0 128c0 56.554 36.676 104.535 87.535 121.46c6.397 1.185 8.746-2.777 8.746-6.158c0-3.052-.117-13.135-.174-23.83c-35.61 7.742-43.124-15.103-43.124-15.103c-5.823-14.795-14.213-18.73-14.213-18.73c-11.613-7.944.876-7.78.876-7.78c12.853.902 19.621 13.19 19.621 13.19c11.417 19.568 29.945 13.911 37.249 10.64c1.149-8.272 4.466-13.92 8.127-17.116c-28.431-3.236-58.318-14.212-58.318-63.258c0-13.975 5-25.394 13.188-34.358c-1.329-3.224-5.71-16.242 1.24-33.874c0 0 10.749-3.44 35.21 13.121c10.21-2.836 21.16-4.258 32.038-4.307c10.878.049 21.837 1.47 32.066 4.307c24.431-16.56 35.165-13.12 35.165-13.12c6.967 17.63 2.584 30.65 1.255 33.873c8.207 8.964 13.173 20.383 13.173 34.358c0 49.163-29.944 59.988-58.447 63.157c4.591 3.972 8.682 11.762 8.682 23.704c0 17.126-.148 30.91-.148 35.126c0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128C256 57.317 198.683 0 128 0"></path></svg> <span>Continue with GitHub</span>`, 1);
var root_2 = $.from_html(`<section class="flex min-h-screen bg-background px-4 py-16 md:py-24"><div class="m-auto w-full max-w-sm rounded-2xl border bg-muted p-8"><div><!> <h1 class="mt-6 font-serif text-2xl font-medium">Sign up</h1> <p class="mt-1 text-sm text-muted-foreground">Create your account to continue</p></div> <form action="" class="mt-8 space-y-5"><div class="space-y-2"><!> <!></div> <!></form> <div class="my-6 flex items-center gap-3"><hr class="flex-1"/> <span class="text-xs text-muted-foreground">or</span> <hr class="flex-1"/></div> <div class="space-y-2"><!> <!></div> <p class="mt-8 text-center text-sm text-muted-foreground">Already have an account? <!></p></div></section>`);

export default function Signup_two($$anchor) {
	var section = root_2();
	var div = $.child(section);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		href: '/',
		'aria-label': 'go home',
		variant: 'ghost',
		size: 'sm',
		class: 'inline-block h-auto p-0 hover:bg-transparent',
		children: ($$anchor, $$slotProps) => {
			Logo($$anchor, { class: 'h-6 w-fit' });
		},
		$$slots: { default: true }
	});

	$.next(4);
	$.reset(div_1);

	var form = $.sibling(div_1, 2);
	var div_2 = $.child(form);
	var node_1 = $.child(div_2);

	Label(node_1, {
		for: 'email',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, {
		type: 'email',
		id: 'email',
		name: 'email',
		placeholder: 'you@example.com',
		required: true
	});

	$.reset(div_2);

	var node_3 = $.sibling(div_2, 2);

	Button(node_3, {
		class: 'w-full',
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Continue with Email');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var div_3 = $.sibling(form, 4);
	var node_4 = $.child(div_3);

	Button(node_4, {
		type: 'button',
		variant: 'outline',
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		type: 'button',
		variant: 'outline',
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();

			$.next(2);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var p = $.sibling(div_3, 2);
	var node_6 = $.sibling($.child(p));

	Button(node_6, {
		href: '/',
		variant: 'link',
		class: 'px-1 font-medium text-primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Sign in');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(p);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}