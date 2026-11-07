import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let name = "Svelte";

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(name.split(''));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let character = each_array[$$index];

		$$renderer.push(`<p>${$.escape(character)}</p> `);

		{
			function inner($$renderer) {
				$$renderer.push(`<a href="#">${$.escape(character)}</a>`);
			}

			Component($$renderer, { inner, $$slots: { inner: true } });
		}

		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!--]-->`);
}