import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const chip = ($$anchor, label = $.noop) => {
	var span = root();
	var text = $.child(span, true);

	$.reset(span);
	$.template_effect(() => $.set_text(text, label()));
	$.append($$anchor, span);
};

const empty = ($$anchor) => {
	var p = root_3();

	$.append($$anchor, p);
};

var root = $.from_html(`<span class="chip svelte-1nz2zt8"> </span>`);
var root_1 = $.from_html(`<div class="tags svelte-1nz2zt8"></div>`);
var root_2 = $.from_html(`<article><div class="avatar svelte-1nz2zt8"> </div> <div class="body"><h3> </h3> <!></div> <!></article>`);
var root_3 = $.from_html(`<p class="empty">No people yet.</p>`);
var root_4 = $.from_html(`<div class="toolbar"><label><input type="checkbox"/> Show tags</label></div> <section class="people svelte-1nz2zt8"></section> <!>`, 1);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const card = ($$anchor, person = $.noop, index = $.noop) => {
		const initials = $.derived(() => person().name.slice(0, 1).toUpperCase());
		var article = root_2();
		let classes;
		var div = $.child(article);
		var text_1 = $.child(div, true);

		$.reset(div);

		var div_1 = $.sibling(div, 2);
		var h3 = $.child(div_1);
		var text_2 = $.child(h3);

		$.reset(h3);

		var node = $.sibling(h3, 2);

		{
			var consequent = ($$anchor) => {
				var div_2 = root_1();

				$.each(div_2, 21, () => person().tags, $.index, ($$anchor, tag) => {
					chip($$anchor, () => $.get(tag));
				});

				$.reset(div_2);
				$.append($$anchor, div_2);
			};

			$.if(node, ($$render) => {
				if ($.get(showTags) && person().tags.length) $$render(consequent);
			});
		}

		$.reset(div_1);

		var node_1 = $.sibling(div_1, 2);

		{
			var consequent_1 = ($$anchor) => {
				chip($$anchor, () => '★ featured');
			};

			$.if(node_1, ($$render) => {
				if (person().featured) $$render(consequent_1);
			});
		}

		$.reset(article);

		$.template_effect(() => {
			classes = $.set_class(article, 1, 'card svelte-1nz2zt8', null, classes, { featured: person().featured });
			$.set_text(text_1, $.get(initials));
			$.set_text(text_2, `#${index() + 1} — ${person().name ?? ''}`);
		});

		$.append($$anchor, article);
	};

	let people = $.proxy([
		{ name: 'Ada', tags: ['math', 'engines'], featured: true },
		{ name: 'Alan', tags: ['logic', 'machines'], featured: false },
		{ name: 'Grace', tags: ['compilers'], featured: true }
	]);

	let showTags = $.state(true);
	var fragment_2 = root_4();
	var div_3 = $.first_child(fragment_2);
	var label_1 = $.child(div_3);
	var input = $.child(label_1);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label_1);
	$.reset(div_3);

	var section = $.sibling(div_3, 2);

	$.each(section, 23, () => people, (person) => person.name, ($$anchor, person, i) => {
		card($$anchor, () => $.get(person), () => $.get(i));
	});

	$.reset(section);

	var node_2 = $.sibling(section, 2);

	{
		var consequent_2 = ($$anchor) => {
			empty($$anchor);
		};

		$.if(node_2, ($$render) => {
			if (people.length === 0) $$render(consequent_2);
		});
	}

	$.bind_checked(input, () => $.get(showTags), ($$value) => $.set(showTags, $$value));
	$.append($$anchor, fragment_2);
	$.pop();
}
