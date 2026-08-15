import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="muted svelte-1yhzv6r">Choose a state…</p>`);
var root_1 = $.from_html(`<p class="ok svelte-1yhzv6r">Ready to go.</p>`);
var root_2 = $.from_html(`<p class="error svelte-1yhzv6r">Something is off.</p>`);
var root_3 = $.from_html(`<button> </button>`);
var root_4 = $.from_html(`<p>Loaded <b> </b> </p>`);
var root_5 = $.from_html(`<p class="error svelte-1yhzv6r"> </p> <button>Retry</button>`, 1);
var root_6 = $.from_html(`<p> </p>`);
var root_7 = $.from_html(`<div class="panel"><!></div>`);
var root_8 = $.from_html(`<li> </li>`);
var root_9 = $.from_html(`<ol></ol>`);
var root_10 = $.from_html(`<p class="muted svelte-1yhzv6r">Empty section.</p>`);
var root_11 = $.from_html(`<section><h3> </h3> <!></section>`);
var root_12 = $.from_html(`<div class="app svelte-1yhzv6r"><!> <div class="controls svelte-1yhzv6r"></div> <div class="raw"></div> <!> <!></div>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let status = $.state('loading');
	let attempt = $.state(0);

	const sections = [
		{ id: 'a', title: 'Intro', items: ['one', 'two', 'three'] },
		{ id: 'b', title: 'Details', items: ['alpha', 'beta'] },
		{ id: 'c', title: 'Outro', items: [] }
	];

	function load() {
		$.set(attempt, $.get(attempt) + 1);

		return new Promise((resolve, reject) => {
			if ($.get(attempt) % 3 === 0) {
				reject(new Error('Network error'));
			} else {
				resolve({ name: 'Report', generated: $.get(attempt) });
			}
		});
	}

	let promise = $.state($.proxy(load()));

	function retry() {
		$.set(promise, load(), true);
	}

	const notice = '<strong>Heads up:</strong> rendered as raw HTML.';
	var div = root_12();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		var alternate = ($$anchor) => {
			var p_2 = root_2();

			$.append($$anchor, p_2);
		};

		$.if(node, ($$render) => {
			if ($.get(status) === 'loading') $$render(consequent); else if ($.get(status) === 'ready') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 20, () => ['loading', 'ready', 'error'], $.index, ($$anchor, s) => {
		var button = root_3();
		let classes;
		var text = $.child(button, true);

		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'svelte-1yhzv6r', null, classes, { active: $.get(status) === s });
			$.set_text(text, s);
		});

		$.delegated('click', button, () => $.set(status, s, true));
		$.append($$anchor, button);
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.html(div_2, () => notice, true);
	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	$.key(node_1, () => $.get(attempt), ($$anchor) => {
		var div_3 = root_7();
		var node_2 = $.child(div_3);

		$.await(
			node_2,
			() => $.get(promise),
			($$anchor) => {
				var p_5 = root_6();
				var text_4 = $.child(p_5);

				$.reset(p_5);
				$.template_effect(() => $.set_text(text_4, `Loading attempt ${$.get(attempt) ?? ''}…`));
				$.append($$anchor, p_5);
			},
			($$anchor, data) => {
				var p_3 = root_4();
				var b = $.sibling($.child(p_3));
				var text_1 = $.child(b, true);

				$.reset(b);

				var text_2 = $.sibling(b);

				$.reset(p_3);

				$.template_effect(() => {
					$.set_text(text_1, $.get(data).name);
					$.set_text(text_2, ` (gen ${$.get(data).generated ?? ''})`);
				});

				$.append($$anchor, p_3);
			},
			($$anchor, error) => {
				var fragment = root_5();
				var p_4 = $.first_child(fragment);
				var text_3 = $.child(p_4);

				$.reset(p_4);

				var button_1 = $.sibling(p_4, 2);

				$.template_effect(() => $.set_text(text_3, `Failed: ${$.get(error).message ?? ''}`));
				$.delegated('click', button_1, retry);
				$.append($$anchor, fragment);
			}
		);

		$.reset(div_3);
		$.append($$anchor, div_3);
	});

	var node_3 = $.sibling(node_1, 2);

	$.each(node_3, 17, () => sections, (section) => section.id, ($$anchor, section) => {
		var section_1 = root_11();
		var h3 = $.child(section_1);
		var text_5 = $.child(h3, true);

		$.reset(h3);

		var node_4 = $.sibling(h3, 2);

		{
			var consequent_2 = ($$anchor) => {
				var ol = root_9();

				$.each(ol, 21, () => $.get(section).items, $.index, ($$anchor, item, i) => {
					var li = root_8();
					var text_6 = $.child(li);

					$.reset(li);
					$.template_effect(() => $.set_text(text_6, `${i + 1}. ${$.get(item) ?? ''}`));
					$.append($$anchor, li);
				});

				$.reset(ol);
				$.append($$anchor, ol);
			};

			var alternate_1 = ($$anchor) => {
				var p_6 = root_10();

				$.append($$anchor, p_6);
			};

			$.if(node_4, ($$render) => {
				if ($.get(section).items.length) $$render(consequent_2); else $$render(alternate_1, -1);
			});
		}

		$.reset(section_1);
		$.template_effect(() => $.set_text(text_5, $.get(section).title));
		$.append($$anchor, section_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);
