import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { on } from 'svelte/events';

var root = $.from_html(`<section><button> </button></section>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	function increment(e) {
		e.stopPropagation();
		$.set(count, $.get(count) + 1);
	}

	let sectionEl;

	$.user_effect(() => {
		return on(sectionEl, 'click', () => {
			console.log('logged from addEventListener');
		});
	});

	var section = root();
	var button = $.child(section);
	var text = $.only_child(button);

	$.reset(section);
	$.bind_this(section, ($$value) => sectionEl = $$value, () => sectionEl);
	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.delegated('click', section, () => console.log('logged from onclick'));
	$.delegated('click', button, increment);
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);