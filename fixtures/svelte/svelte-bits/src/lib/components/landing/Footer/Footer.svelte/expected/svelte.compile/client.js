import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import logo from '$lib/assets/logo/svelte-bits-logo.svg';
import { GITHUB_URL } from '$lib/constants/site';
import './Footer.css';

var root = $.from_html(`<footer class="ln-footer"><div class="ln-footer-glow"></div> <div class="ln-footer-separator"></div> <div><div class="ln-footer-top"><div class="ln-footer-brand"><img alt="Svelte Bits" class="ln-footer-logo"/> <p class="ln-footer-tagline">Animated UI components for Svelte.</p></div> <nav class="ln-footer-nav"><div class="ln-footer-col"><span class="ln-footer-col-title">Product</span> <a href="/get-started/introduction" class="ln-footer-link">Docs</a></div> <div class="ln-footer-col"><span class="ln-footer-col-title">Community</span> <a target="_blank" rel="noopener noreferrer" class="ln-footer-link">GitHub</a> <a href="https://reactbits.dev/" target="_blank" rel="noopener noreferrer" class="ln-footer-link">React Bits</a> <a href="https://vue-bits.dev/" target="_blank" rel="noopener noreferrer" class="ln-footer-link">Vue Bits</a></div></nav></div> <div class="ln-footer-bottom"><p class="ln-footer-attribution">A Svelte port of <a href="https://reactbits.dev/" target="_blank" rel="noopener noreferrer" class="ln-footer-creator">React Bits</a> by <a href="https://x.com/davidhdev" target="_blank" rel="noopener noreferrer" class="ln-footer-creator">davidhdev</a>.</p> <p class="ln-footer-copy"> </p></div></div></footer>`);

export default function Footer($$anchor, $$props) {
	$.push($$props, true);

	const year = new Date().getFullYear();
	let innerEl = $.state(null);
	let visible = $.state(false);

	onMount(() => {
		if (!$.get(innerEl)) return;

		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						$.set(visible, true);
						io.disconnect();
					}
				}
			},
			{ threshold: 0.1, rootMargin: '-60px' }
		);

		io.observe($.get(innerEl));

		return () => io.disconnect();
	});

	var footer = root();
	var div = $.sibling($.child(footer), 4);
	let classes;
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var img = $.child(div_2);

	$.next(2);
	$.reset(div_2);

	var nav = $.sibling(div_2, 2);
	var div_3 = $.sibling($.child(nav), 2);
	var a = $.sibling($.child(div_3), 2);

	$.next(4);
	$.reset(div_3);
	$.reset(nav);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var p = $.sibling($.child(div_4), 2);
	var text = $.only_child(p);

	$.reset(div_4);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(innerEl, $$value), () => $.get(innerEl));
	$.reset(footer);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'ln-footer-inner', null, classes, { 'is-visible': $.get(visible) });
		$.set_attribute(img, 'src', logo);
		$.set_attribute(a, 'href', GITHUB_URL);
		$.set_text(text, `© ${year ?? ''} Svelte Bits`);
	});

	$.append($$anchor, footer);
	$.pop();
}