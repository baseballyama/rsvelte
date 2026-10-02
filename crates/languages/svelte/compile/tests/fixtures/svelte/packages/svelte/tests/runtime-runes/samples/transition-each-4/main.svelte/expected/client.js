import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <div> </div>`, 1);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<button>Toggle</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function fade(_) {
		return { duration: 500, css: (t) => `opacity: ${t}` };
	}

	let toggle = $.state(true);
	let items = $.state($.proxy([1, 2, 3]));

	const handle_toggle = async () => {
		$.set(toggle, false);
		await Promise.resolve();
		$.set(items, [3, 4], true);
		$.set(toggle, true);
	};

	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root_1();

			$.each(div, 20, () => $.get(items), (item) => item, ($$anchor, item) => {
				$.next();

				var fragment_1 = root();
				var text = $.first_child(fragment_1);
				var div_1 = $.sibling(text);
				var text_1 = $.only_child(div_1, true);

				$.template_effect(
					($0) => {
						$.set_text(text, `${$0 ?? ''} `);
						$.set_text(text_1, item);
					},
					[
						() => (() => {
							$.user_effect(() => {
								$.get(items);
								console.log('$effect');
							});

							$.user_pre_effect(() => {
								$.get(items);
								console.log('$effect.pre');
							});
						})()
					]
				);

				$.append($$anchor, fragment_1);
			});

			$.reset(div);
			$.transition(3, div, () => fade);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(toggle)) $$render(consequent);
		});
	}

	$.delegated('click', button, handle_toggle);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);