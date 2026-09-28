import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img class="newsletter-nugs svelte-1rpji6v" src="/snackpack/snackpack-submark-nuggets.webp" alt="Syntax Snack Pack Logo"/>`);

export default function NewsletterLogo($$anchor) {
	var img = root();

	$.append($$anchor, img);
}