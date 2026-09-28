import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LoaderIcon } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { ForgotPasswordModule, forgotPasswordSchema as schemas } from '$lib/core/composables/index.js';

var root = $.from_html(`<!> Send Reset Link`, 1);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Back to Login`, 1);
var root_2 = $.from_html(`<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"><div class="-mt-24 flex w-full items-center justify-center gap-8 p-4"><div class="w-full max-w-md transform space-y-6 rounded-lg border bg-white/80 p-8 backdrop-blur-sm transition-all dark:bg-gray-800/90"><div class="space-y-2 text-center"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2> <p class="text-gray-500 dark:text-gray-400">Enter your email to receive reset instructions</p></div> <form class="space-y-4"><!> <!></form> <div class="relative"><div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div> <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-2 text-gray-500 dark:bg-gray-800">Or</span></div></div> <div class="text-center"><!></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const forgotPasswordModule = new ForgotPasswordModule();
	var div = root_2();

	$.head('1jwg7wm', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Forgot Password';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var form = $.sibling($.child(div_2), 2);
	var node = $.child(form);

	Textbox(node, {
		name: 'email',
		type: 'email',
		placeholder: 'swadesh@litekrat.in',
		get schema() {
			return schemas.email;
		},
		label: 'Email',
		required: true,
		get value() {
			return forgotPasswordModule.email;
		},

		set value($$value) {
			forgotPasswordModule.email = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		type: 'submit',
		class: 'w-full',
		get disabled() {
			return forgotPasswordModule.isLoading;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					LoaderIcon($$anchor, { class: 'mr-2 h-4 w-4 animate-spin' });
				};

				$.if(node_2, ($$render) => {
					if (forgotPasswordModule.isLoading) $$render(consequent);
				});
			}

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var div_3 = $.sibling(form, 4);
	var node_3 = $.child(div_3);

	AuthButton(node_3, {
		type: 'login',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				variant: 'link',
				class: 'inline-flex items-center text-sm text-gray-600 hover:text-gray-500',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();

					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.event('submit', form, (e) => forgotPasswordModule.handleSubmit(e, true));
	$.append($$anchor, div);
	$.pop();
}