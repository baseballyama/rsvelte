import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

var root = $.from_html(`<div class="item svelte-r5xqhe"> </div>`);
var root_1 = $.from_html(`<div class="container"><div><div class="items svelte-r5xqhe"></div> <button class="svelte-r5xqhe">Shuffle</button></div></div>`);

export default function Gsap_flip($$anchor, $$props) {
	$.push($$props, true);
	gsap.registerPlugin(Flip);

	let items = $.state($.proxy([...Array(10).keys()]));

	$.user_pre_effect(() => {
		// track `items` as a dependency
		$.get(items);

		// measure elements before the DOM updates
		const state = Flip.getState('.item');

		// wait for the DOM update
		tick().then(() => {
			// do the FLIP animation
			Flip.from(state, { duration: 1, stagger: 0.01, ease: 'power1.inOut' });
		});
	});

	function shuffle() {
		$.set(items, $.get(items).toSorted(() => Math.random() - 0.5), true);
	}

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.each(div_2, 20, () => $.get(items), (item) => item, ($$anchor, item) => {
		var div_3 = root();
		var text = $.only_child(div_3, true);

		$.template_effect(() => $.set_text(text, item));
		$.append($$anchor, div_3);
	});

	$.reset(div_2);

	var button = $.sibling(div_2, 2);

	$.reset(div_1);
	$.reset(div);
	$.delegated('click', button, shuffle);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);