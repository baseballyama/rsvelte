import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function SnsBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<div class="sns-bar svelte-5ligkr"${$.attr_style('', { 'margin-left': 'auto' })}><div class="sns svelte-5ligkr"><a class="github-button svelte-5ligkr" href="https://github.com/sveltejs/svelte-eslint-parser" data-show-count="true" aria-label="Star sveltejs/svelte-eslint-parser on GitHub">Star</a> <a href="https://www.npmjs.com/package/svelte-eslint-parser" class="svelte-5ligkr"><img src="https://img.shields.io/npm/v/svelte-eslint-parser.svg" alt="npm"/></a></div></div>`);
	});
}