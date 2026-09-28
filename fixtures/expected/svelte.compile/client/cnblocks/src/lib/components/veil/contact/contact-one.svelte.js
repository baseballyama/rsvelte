import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { Input } from "$lib/components/ui/veil/input";
import { Label } from "$lib/components/ui/label";
import { Textarea } from "$lib/components/ui/veil/textarea";

var root = $.from_html(`<form action="" class="space-y-5"><div class="grid gap-4 @md:grid-cols-2"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div> <!></form>`);

var root_1 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-3xl px-6"><div><h1 class="font-serif text-4xl font-medium text-balance sm:text-5xl">Get in Touch</h1> <p class="mt-4 max-w-md text-balance text-muted-foreground">Have questions? We'd love to hear from you. Send us a message and we'll respond as
				soon as possible.</p></div> <div class="mt-12 grid gap-8 @xl:grid-cols-5"><div class="space-y-6 *:space-y-2 @xl:col-span-2"><div><p class="text-sm font-medium text-foreground">Email</p> <a href="mailto:hello@example.com" class="text-sm text-muted-foreground hover:text-primary">hello@example.com</a></div> <div><p class="text-sm font-medium text-foreground">Phone</p> <a href="tel:+1234567890" class="text-sm text-muted-foreground hover:text-primary">+1 (234) 567-890</a></div> <div><p class="text-sm font-medium text-foreground">Office</p> <p class="text-sm text-muted-foreground">123 Main Street, San Francisco, CA 94102</p></div></div> <!></div></div></section>`);

export default function Contact_one($$anchor) {
	var section = root_1();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.sibling($.child(div_1), 2);

	Card(node, {
		variant: 'outline',
		class: 'p-6 @xl:col-span-3',
		children: ($$anchor, $$slotProps) => {
			var form = root();
			var div_2 = $.child(form);
			var div_3 = $.child(div_2);
			var node_1 = $.child(div_3);

			Label(node_1, {
				for: 'name',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Name');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Input(node_2, {
				type: 'text',
				id: 'name',
				name: 'name',
				placeholder: 'Your name',
				required: true
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_3 = $.child(div_4);

			Label(node_3, {
				for: 'email',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Email');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Input(node_4, {
				type: 'email',
				id: 'email',
				name: 'email',
				placeholder: 'you@example.com',
				required: true
			});

			$.reset(div_4);
			$.reset(div_2);

			var div_5 = $.sibling(div_2, 2);
			var node_5 = $.child(div_5);

			Label(node_5, {
				for: 'subject',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Subject');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Input(node_6, {
				type: 'text',
				id: 'subject',
				name: 'subject',
				placeholder: 'How can we help?'
			});

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var node_7 = $.child(div_6);

			Label(node_7, {
				for: 'message',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Message');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Textarea(node_8, {
				id: 'message',
				name: 'message',
				rows: 4,
				placeholder: 'Tell us more...',
				required: true,
				class: 'min-h-28'
			});

			$.reset(div_6);

			var node_9 = $.sibling(div_6, 2);

			Button(node_9, {
				class: 'w-full',
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Send Message');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(form);
			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}