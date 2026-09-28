import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="https://svelte.dev" target="_blank">svelte website (invalid)</a> <a href="https://svelte.dev" target="_blank" rel="">svelte website (invalid)</a> <a href="https://svelte.dev" target="_blank" rel="noopener">svelte website (invalid)</a> <a target="_blank">svelte website (invalid)</a> <a target="_blank" rel="">svelte website (invalid)</a> <a target="_blank" rel="noopener">svelte website (invalid)</a> <a href="//svelte.dev" target="_blank">svelte website (invalid)</a> <a href="//svelte.dev" target="_blank" rel="">svelte website (invalid)</a> <a href="//svelte.dev" target="_blank" rel="noopener">svelte website (invalid)</a> <a href="http://svelte.dev" target="_blank">svelte website (invalid)</a> <a href="http://svelte.dev" target="_blank" rel="">svelte website (invalid)</a> <a href="http://svelte.dev" target="_blank" rel="noopener">svelte website (invalid)</a> <a href="HTTP://svelte.dev" target="_blank">svelte website (invalid)</a> <a href="HTTP://svelte.dev" target="_blank" rel="">svelte website (invalid)</a> <a href="HTTP://svelte.dev" target="_blank" rel="noopener">svelte website (invalid)</a> <a target="_blank">svelte website (invalid)</a> <a target="_blank" rel="">svelte website (invalid)</a> <a target="_blank" rel="noopener">svelte website (invalid)</a> <a href="same-host" target="_blank">Same host (valid)</a> <a href="same-host" target="_blank" rel="">Same host (valid)</a> <a href="same-host" target="_blank" rel="noopener">Same host (valid)</a> <a href="http://svelte.dev" target="_blank" rel="noreferrer">svelte website (valid)</a> <a href="http://svelte.dev" target="_blank" rel="noreferrer noopener">svelte website (valid)</a> <a href="HTTP://svelte.dev" target="_blank" rel="noreferrer">svelte website (valid)</a> <a href="HTTP://svelte.dev" target="_blank" rel="noreferrer noopener">svelte website (valid)</a> <a href="https://svelte.dev" target="_blank" rel="noreferrer">svelte website (valid)</a> <a href="https://svelte.dev" target="_blank" rel="noreferrer noopener">svelte website (valid)</a> <a href="HTTPS://svelte.dev" target="_blank" rel="noreferrer">svelte website (valid)</a> <a href="HTTPS://svelte.dev" target="_blank" rel="noreferrer noopener">svelte website (valid)</a> <a href="//svelte.dev" target="_blank" rel="noreferrer">svelte website (valid)</a> <a href="//svelte.dev" target="_blank" rel="noreferrer noopener">svelte website (valid)</a> <a href="//svelte.dev" target="_blank">svelte website (valid)</a>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 6);

	$.set_attribute(a, 'href', 'https://svelte.dev');

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', 'https://svelte.dev');

	var a_2 = $.sibling(a_1, 2);

	$.set_attribute(a_2, 'href', 'https://svelte.dev');

	var a_3 = $.sibling(a_2, 20);

	$.set_attribute(a_3, 'href', 'HTTPS://svelte.dev');

	var a_4 = $.sibling(a_3, 2);

	$.set_attribute(a_4, 'href', 'HTTPS://svelte.dev');

	var a_5 = $.sibling(a_4, 2);

	$.set_attribute(a_5, 'href', 'HTTPS://svelte.dev');

	var a_6 = $.sibling(a_5, 28);

	$.set_attribute(a_6, 'rel', `${Math.random()}`);
	$.append($$anchor, fragment);
}