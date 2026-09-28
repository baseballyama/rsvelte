import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Heading from '$lib/ui/heading.svelte';

var root = $.from_html(
	`<!> <main class="svelte-cwls5q"><p>Hey! 👋</p> <p>I'm <b>Matia</b> from 🇭🇷 <b>Croatia</b> and I'm infinitely curious at how
		things work but I'm mostly passionate about ☕ <b>JavaScript and</b> 🎨 <b>UI/UX design</b>.</p> <p>I created <b>Joy of Code</b> because I think a lot of tutorials don't help you
		learn how to solve problems but just read the documentation to you and go from
		point A to point B.</p> <p><strong>I want to show you steps between A and B</strong> by sharing what I learn
		and how I think about solving problems.</p> <p>I'm trying to create something I wish existed — it's more like having a
		friend help you out instead of someone talking over your head.</p></main>`,
	1
);

export default function _page($$anchor) {
	var fragment = root();

	$.head('cwls5q', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'About';
		});
	});

	var node = $.first_child(fragment);

	Heading(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('About');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.append($$anchor, fragment);
}