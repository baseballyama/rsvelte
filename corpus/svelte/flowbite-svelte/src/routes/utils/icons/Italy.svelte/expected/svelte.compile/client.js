import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg aria-hidden="true" class="me-2 h-3.5 w-3.5 rounded-full" xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-it" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#fff" d="M0 0h512v512H0z"></path><path fill="#009246" d="M0 0h170.7v512H0z"></path><path fill="#ce2b37" d="M341.3 0H512v512H341.3z"></path></g></svg>`);

export default function Italy($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}