import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonGroup, Button, Input } from "$lib";
import Mail from "../utils/icons/Mail.svelte";

var root = $.from_html(`<p class="mb-2 text-red-600"> </p>`);
var root_1 = $.from_html(`<p class="mb-2 text-green-600"> </p>`);
var root_2 = $.from_html(`<div class="flex items-center"><span class="mr-2">Subscribing...</span> <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<aside class="mb-8 flex flex-col items-start justify-center gap-4 rounded-lg border bg-white p-4 shadow-lg sm:p-8 dark:border-gray-700 dark:bg-gray-800"><div class="flex flex-col items-center gap-5"><div class="flex flex-col items-start gap-4"><h4 class="text-xl leading-none font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">Get more updates</h4> <p class="max-w-2xl">Stay up to date with the roadmap progress, announcements and exclusive discounts feel free to sign up with your email.</p></div> <div class="flex flex-col items-start justify-center self-stretch"><form class="self-stretch"><div class="mb-3 flex items-end"><!> <!> <div class="flex w-full max-w-md items-center"><label for="member_email" class="sr-only">Email address</label> <div class="relative"><!></div> <!></div></div></form> <div class="text-sm font-medium text-gray-500 dark:text-gray-300">By subscribing, you agree with ConvertKit's <a rel="nofollow" href="https://convertkit.com/terms" class="text-primary-700 dark:text-primary-600 hover:underline">Terms of Service</a> and <a rel="nofollow" class="text-primary-700 dark:text-primary-600 hover:underline" href="https://convertkit.com/privacy">Privacy Policy</a> .</div></div></div></aside>`);

export default function Newsletter($$anchor, $$props) {
	$.push($$props, true);

	// import { browser } from "$app/environment";
	// import data from "./data.json";
	// import { onMount } from "svelte";
	let email = $.state("");

	let isSubmitting = $.state(false);
	let errorMessage = $.state("");
	let successMessage = $.state("");

	function preventDefault(fn) {
		return function (event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}

	// Handle form submission
	async function handleSubmit() {
		if (!$.get(email)) return;

		$.set(isSubmitting, true);
		$.set(errorMessage, "");
		$.set(successMessage, "");

		try {
			// Option 1: Use your own server endpoint to proxy the request
			// const response = await fetch('/api/newsletter-signup', {
			//  method: 'POST',
			//  headers: { 'Content-Type': 'application/json' },
			//  body: JSON.stringify({ email })
			// });
			// Option 2: Direct client-side submission with no-cors mode
			const formData = new FormData();

			formData.append("email_address", $.get(email));
			formData.append("fields[source]", window.location.href);

			await fetch("https://app.convertkit.com/forms/4692392/subscriptions", {
				method: "POST",
				mode: "no-cors", // This is key to avoiding CORS errors
				body: formData
			});

			// Since we're using no-cors, we can't read the response
			// So we'll just assume success if no error is thrown
			$.set(successMessage, "Thanks for subscribing!");

			$.set(email, "");
		} catch(error) {
			console.error("Subscription error:", error);
			$.set(errorMessage, "Something went wrong. Please try again.");
		} finally {
			$.set(isSubmitting, false);
		}
	}

	var aside = root_4();
	var div = $.child(aside);
	var div_1 = $.sibling($.child(div), 2);
	var form = $.child(div_1);
	var event_handler = $.derived(() => preventDefault(handleSubmit));
	var div_2 = $.child(form);
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(errorMessage)));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(errorMessage)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(successMessage)));
			$.append($$anchor, p_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(successMessage)) $$render(consequent_1);
		});
	}

	var div_3 = $.sibling(node_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var node_2 = $.child(div_4);

	Mail(node_2, { class: 'absolute start-4 top-1/2 -translate-y-1/2' });
	$.reset(div_4);

	var node_3 = $.sibling(div_4, 2);

	ButtonGroup(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_3();
			var node_4 = $.first_child(fragment);

			Input(node_4, {
				size: 'lg',
				id: 'member_email',
				class: 'focus:ring-primary-600 focus:border-primary-600 ps-12 text-gray-900 sm:w-96!',
				'aria-label': 'Email Address',
				placeholder: 'Your email address...',
				required: true,
				type: 'email',
				get value() {
					return $.get(email);
				},

				set value($$value) {
					$.set(email, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				type: 'submit',
				color: 'primary',
				size: 'xl',
				class: 'self-stretch',
				get disabled() {
					return $.get(isSubmitting);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_6 = $.first_child(fragment_1);

					{
						var consequent_2 = ($$anchor) => {
							var div_5 = root_2();

							$.append($$anchor, div_5);
						};

						var alternate = ($$anchor) => {
							var text_2 = $.text('Subscribe');

							$.append($$anchor, text_2);
						};

						$.if(node_6, ($$render) => {
							if ($.get(isSubmitting)) $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
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

	$.event('submit', form, function (...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});

	$.append($$anchor, aside);
	$.pop();
}