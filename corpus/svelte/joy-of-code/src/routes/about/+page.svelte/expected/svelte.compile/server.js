import * as $ from 'svelte/internal/server';
import Heading from '$lib/ui/heading.svelte';

export default function _page($$renderer) {
	$.head('cwls5q', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>About</title>`);
		});
	});

	Heading($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->About`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <main class="svelte-cwls5q"><p>Hey! 👋</p> <p>I'm <b>Matia</b> from 🇭🇷 <b>Croatia</b> and I'm infinitely curious at how
		things work but I'm mostly passionate about ☕ <b>JavaScript and</b> 🎨 <b>UI/UX design</b>.</p> <p>I created <b>Joy of Code</b> because I think a lot of tutorials don't help you
		learn how to solve problems but just read the documentation to you and go from
		point A to point B.</p> <p><strong>I want to show you steps between A and B</strong> by sharing what I learn
		and how I think about solving problems.</p> <p>I'm trying to create something I wish existed — it's more like having a
		friend help you out instead of someone talking over your head.</p></main>`);
}