import * as $ from 'svelte/internal/server';
import get_show_path from '$/utilities/slug.js';
import HostSocialLink from '$lib/hosts/HostSocialLink.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let guests = [];

		function jumble() {
			let currentIndex = guests.length, randomIndex;

			// While there remain elements to shuffle...
			while (currentIndex != 0) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);

				currentIndex--;

				// And swap it with the current element.
				[guests[currentIndex], guests[randomIndex]] = [guests[randomIndex], guests[currentIndex]];
			}

			return guests;
		}

		function most_recent() {
			guests = guests.sort((a, b) => {
				return b.shows[0].Show.number - a.shows[0].Show.number;
			});
		}

		let name_size_direction = '';

		function name_size() {
			name_size_direction = name_size_direction === 'asc' ? 'desc' : 'asc';

			guests = guests.sort((a, b) => {
				return name_size_direction === 'desc'
					? b.name.length - a.name.length
					: a.name.length - b.name.length;
			});
		}

		$$renderer.push(`<section><h1 class="lines">Guests</h1> <p>Every Friday we have an industry expert on the show - we call it <strong>"Supper Club"</strong>.
		This isn't a book tour, these are real developers who write the code and shape what the future
		of web development looks like.</p> <p>We maintain a list of all ${$.escape(guests.length)} guests on <a href="https://twitter.com/i/lists/1719788389681987648"><strike>twitter</strike> 𝕏</a>. You
		should follow it!</p> <div class="center"${$.attr_style('', { 'margin-bottom': '1rem' })}><p class="text-sm lines">♥ hardly useful filters ♥</p> <button>Jumble</button> <button>Most Recent</button> <button>Name Size ${$.escape(name_size_direction ? name_size_direction === 'desc' ? '↓' : '↑' : '')}</button></div> <div class="guests svelte-mhd6i5"><!--[-->`);

		const each_array = $.ensure_array_like(guests);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let guest = each_array[index];

			$$renderer.push(`<div class="guest svelte-mhd6i5"><div class="svelte-mhd6i5"><a${$.attr('href', `/guest/${$.stringify(guest.name_slug)}`)}><img${$.attr('src', `https://github.com/${$.stringify(guest.github || 'null')}.png`)}${$.attr('alt', guest.name)} width="460" height="460"${$.attr('loading', index < 10 ? 'eager' : 'lazy')} class="svelte-mhd6i5"/></a></div> <div class="info svelte-mhd6i5"><h2${$.attr_style(`--chars: ${$.stringify(guest.name.length)}`)} class="svelte-mhd6i5"><a${$.attr('href', `/guest/${$.stringify(guest.name_slug)}`)}>${$.escape(guest.name)}</a></h2> <p class="of svelte-mhd6i5">${$.escape(guest.of || ``)} </p> <div class="socials center">`);
			HostSocialLink($$renderer, { host: guest });
			$$renderer.push(`<!----></div> <div class="show-links svelte-mhd6i5"><!--[-->`);

			const each_array_1 = $.ensure_array_like(guest.shows);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let { Show } = each_array_1[$$index];

				$$renderer.push(`<a${$.attr('title', Show.title)} class="grit svelte-mhd6i5"${$.attr('href', get_show_path(Show))}>#${$.escape(Show.number)}</a>`);
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div></section>`);
	});
}