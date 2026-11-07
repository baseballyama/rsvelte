import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from "$app/environment";
import { ButtonGroup, Button, Input } from "flowbite-svelte";
import Mail from "../utils/icons/Mail.svelte";
import data from "./data.json";

var root = $.with_script($.from_html(`<script src="https://f.convertkit.com/ckjs/ck.5.js"></script><!>`, 1));
var root_1 = $.from_html(`<div class="formkit-spinner"><div></div> <div></div> <div></div></div> Subscribe`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<aside class="mb-8 flex flex-col items-start justify-center gap-4 rounded-lg border p-4 shadow-lg sm:p-8 dark:border-gray-700 dark:bg-gray-800"><div class="flex flex-col items-center gap-5"><div class="flex flex-col items-start gap-4"><h4 class="text-xl leading-none font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">Get more updates</h4> <p class="max-w-2xl">Stay up to date with the roadmap progress, announcements and exclusive discounts feel free to sign up with your email.</p></div> <div class="flex flex-col items-start justify-center self-stretch"><!> <form action="https://app.convertkit.com/forms/4692392/subscriptions" class="seva-form formkit-form self-stretch" method="post" data-sv-form="4692392" data-uid="344e3b5c48" data-format="inline" data-version="5"><div data-style="clean" class="mb-3 flex items-end"><ul class="formkit-alert formkit-alert-error" data-element="errors" data-group="alert"></ul> <div data-element="fields" data-stacked="false" class="seva-fields formkit-fields flex w-full max-w-md items-center"><label for="member_email" class="sr-only">Email address</label> <div class="formkit-field relative"><!></div> <!></div></div></form> <div class="text-sm font-medium text-gray-500 dark:text-gray-300">By subscribing, you agree with ConvertKit's <a rel="nofollow" href="https://convertkit.com/terms" class="text-primary-700 dark:text-primary-600 hover:underline">Terms of Service</a> and <a rel="nofollow" class="text-primary-700 dark:text-primary-600 hover:underline" href="https://convertkit.com/privacy">Privacy Policy</a> .</div></div></div></aside>`);

export default function Newsletter($$anchor) {
	var aside = root_3();
	var div = $.child(aside);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment));

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (browser) $$render(consequent);
		});
	}

	var form = $.sibling(node, 2);
	var div_2 = $.child(form);
	var div_3 = $.sibling($.child(div_2), 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var node_2 = $.child(div_4);

	Mail(node_2, { class: 'absolute top-1/2 left-4 -translate-y-1/2' });
	$.reset(div_4);

	var node_3 = $.sibling(div_4, 2);

	ButtonGroup(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_4 = $.first_child(fragment_1);

			Input(node_4, {
				size: 'lg',
				id: 'member_email',
				class: 'formkit-input focus:ring-primary-600 focus:border-primary-600 pl-12 text-gray-900 sm:w-96!',
				name: 'email_address',
				'aria-label': 'Email Address',
				placeholder: 'Your email address...',
				required: true,
				type: 'email'
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				type: 'submit',
				color: 'primary',
				size: 'xl',
				class: 'formkit-submit self-stretch',
				'data-element': 'submit',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(form);
	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.reset(aside);
	$.template_effect(($0) => $.set_attribute(form, 'data-options', $0), [() => JSON.stringify(data)]);
	$.append($$anchor, aside);
}