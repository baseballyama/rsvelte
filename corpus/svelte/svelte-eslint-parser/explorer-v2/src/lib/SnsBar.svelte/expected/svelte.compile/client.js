import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="sns-bar svelte-5ligkr"><div class="sns svelte-5ligkr"><a class="github-button svelte-5ligkr" href="https://github.com/sveltejs/svelte-eslint-parser" data-show-count="true" aria-label="Star sveltejs/svelte-eslint-parser on GitHub">Star</a> <a href="https://www.npmjs.com/package/svelte-eslint-parser" class="svelte-5ligkr"><img src="https://img.shields.io/npm/v/svelte-eslint-parser.svg" alt="npm"/></a></div></div>`);

export default function SnsBar($$anchor, $$props) {
	$.push($$props, true);

	let timeoutId = null;

	/**
	 * setup
	 */
	function setup() {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(
			() => {
				(function (d, s, id) {
					const [fjs] = d.getElementsByTagName(s);

					if (d.getElementById(id)) {
						return;
					}

					const js = d.createElement(s);

					js.id = id;
					js.src = 'https://buttons.github.io/buttons.js';
					fjs.parentNode.insertBefore(js, fjs);
				})(document, 'script', 'gh-buttons');
			},
			500
		);
	}

	onMount(() => {
		setup();
	});

	var div = root();

	$.set_style(div, '', {}, { 'margin-left': 'auto' });
	$.append($$anchor, div);
	$.pop();
}