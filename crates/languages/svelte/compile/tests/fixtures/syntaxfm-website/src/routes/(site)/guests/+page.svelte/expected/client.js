import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import get_show_path from '$/utilities/slug.js';
import HostSocialLink from '$lib/hosts/HostSocialLink.svelte';

var root = $.from_html(`<a class="grit svelte-mhd6i5"> </a>`);
var root_1 = $.from_html(`<div class="guest svelte-mhd6i5"><div class="svelte-mhd6i5"><a><img width="460" height="460" class="svelte-mhd6i5"/></a></div> <div class="info svelte-mhd6i5"><h2 class="svelte-mhd6i5"><a> </a></h2> <p class="of svelte-mhd6i5"> </p> <div class="socials center"><!></div> <div class="show-links svelte-mhd6i5"></div></div></div>`);

var root_2 = $.from_html(`<section><h1 class="lines">Guests</h1> <p>Every Friday we have an industry expert on the show - we call it <strong>"Supper Club"</strong>.
		This isn't a book tour, these are real developers who write the code and shape what the future
		of web development looks like.</p> <p> <a href="https://twitter.com/i/lists/1719788389681987648"><strike>twitter</strike> 𝕏</a>. You
		should follow it!</p> <div class="center"><p class="text-sm lines">&hearts; hardly useful filters &hearts;</p> <button>Jumble</button> <button>Most Recent</button> <button> </button></div> <div class="guests svelte-mhd6i5"></div></section>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let guests = $.state($.proxy([]));

	$.user_effect(() => {
		(($$value) => {
			$.set(guests, $$value.guests, true);
		})($$props.data);
	});

	function jumble() {
		let currentIndex = $.get(guests).length,
			randomIndex;

		// While there remain elements to shuffle...
		while (currentIndex != 0) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);

			currentIndex--;

			// And swap it with the current element.
			(($$value) => {
				var $$array = $.to_array($$value, 2);

				$.get(guests)[currentIndex] = $$array[0];
				$.get(guests)[randomIndex] = $$array[1];
			})([$.get(guests)[randomIndex], $.get(guests)[currentIndex]]);
		}

		return $.get(guests);
	}

	function most_recent() {
		$.set(
			guests,
			$.get(guests).sort((a, b) => {
				return b.shows[0].Show.number - a.shows[0].Show.number;
			}),
			true
		);
	}

	let name_size_direction = $.state('');

	function name_size() {
		$.set(name_size_direction, $.get(name_size_direction) === 'asc' ? 'desc' : 'asc', true);

		$.set(
			guests,
			$.get(guests).sort((a, b) => {
				return $.get(name_size_direction) === 'desc'
					? b.name.length - a.name.length
					: a.name.length - b.name.length;
			}),
			true
		);
	}

	var section = root_2();
	var p = $.sibling($.child(section), 4);
	var text = $.child(p);

	$.next(2);
	$.reset(p);

	var div = $.sibling(p, 2);

	$.set_style(div, '', {}, { 'margin-bottom': '1rem' });

	var button = $.sibling($.child(div), 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var text_1 = $.only_child(button_2);

	$.reset(div);

	var div_1 = $.sibling(div, 2);

	$.each(div_1, 21, () => $.get(guests), $.index, ($$anchor, guest, index) => {
		var div_2 = root_1();
		var div_3 = $.child(div_2);
		var a_1 = $.child(div_3);
		var img = $.child(a_1);

		$.set_attribute(img, 'loading', index < 10 ? 'eager' : 'lazy');
		$.reset(a_1);
		$.reset(div_3);

		var div_4 = $.sibling(div_3, 2);
		var h2 = $.child(div_4);
		var a_2 = $.child(h2);
		var text_2 = $.only_child(a_2, true);

		$.reset(h2);

		var p_1 = $.sibling(h2, 2);
		var text_3 = $.only_child(p_1);
		var div_5 = $.sibling(p_1, 2);
		var node = $.child(div_5);

		HostSocialLink(node, {
			get host() {
				return $.get(guest);
			}
		});

		$.reset(div_5);

		var div_6 = $.sibling(div_5, 2);

		$.each(div_6, 21, () => $.get(guest).shows, $.index, ($$anchor, $$item) => {
			let Show = () => $.get($$item).Show;
			var a_3 = root();
			var text_4 = $.only_child(a_3);

			$.template_effect(
				($0) => {
					$.set_attribute(a_3, 'title', Show().title);
					$.set_attribute(a_3, 'href', $0);
					$.set_text(text_4, `#${Show().number ?? ''}`);
				},
				[() => get_show_path(Show())]
			);

			$.append($$anchor, a_3);
		});

		$.reset(div_6);
		$.reset(div_4);
		$.reset(div_2);

		$.template_effect(() => {
			$.set_attribute(a_1, 'href', `/guest/${$.get(guest).name_slug ?? ''}`);
			$.set_attribute(img, 'src', `https://github.com/${($.get(guest).github || 'null') ?? ''}.png`);
			$.set_attribute(img, 'alt', $.get(guest).name);
			$.set_style(h2, `--chars: ${$.get(guest).name.length ?? ''}`);
			$.set_attribute(a_2, 'href', `/guest/${$.get(guest).name_slug ?? ''}`);
			$.set_text(text_2, $.get(guest).name);
			$.set_text(text_3, `${($.get(guest).of || ``) ?? ''} `);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(section);

	$.template_effect(() => {
		$.set_text(text, `We maintain a list of all ${$.get(guests).length ?? ''} guests on `);

		$.set_text(text_1, `Name Size ${$.get(name_size_direction)
			? $.get(name_size_direction) === 'desc' ? '↓' : '↑'
			: ''}`);
	});

	$.delegated('click', button, jumble);
	$.delegated('click', button_1, most_recent);
	$.delegated('click', button_2, name_size);
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);