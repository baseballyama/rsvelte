import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="empty svelte-1fo3vwf">not selected</span>`);
var root_1 = $.from_html(`<div class="list svelte-1fo3vwf"><span><!></span></div>`);
var root_2 = $.from_html(`<div class="custom-option svelte-1fo3vwf"><div class="info svelte-1fo3vwf"><div class="label"> </div> <div class="code svelte-1fo3vwf"> </div></div></div>`);

export default function EditorDestinationsCell($$anchor, $$props) {
	$.push($$props, true);

	const countriesCount = $.derived(() => $$props.data.length);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_1();
			var span = $.child(div);
			var node_1 = $.child(span);

			{
				var consequent = ($$anchor) => {
					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => $$props.data.map((item) => item.label).join(", ")]);
					$.append($$anchor, text);
				};

				var consequent_1 = ($$anchor) => {
					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} and ${$.get(countriesCount) - 3} more`), [
						() => $$props.data.slice(0, 3).map((item) => item.label).join(", ")
					]);

					$.append($$anchor, text_1);
				};

				var alternate = ($$anchor) => {
					var span_1 = root();

					$.append($$anchor, span_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(countriesCount) && $.get(countriesCount) <= 3) $$render(consequent); else if ($.get(countriesCount) > 3) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.reset(span);
			$.reset(div);
			$.append($$anchor, div);
		};

		var d = $.derived(() => Array.isArray($$props.data));

		var alternate_1 = ($$anchor) => {
			var div_1 = root_2();
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var text_2 = $.only_child(div_3);
			var div_4 = $.sibling(div_3, 2);
			var text_3 = $.only_child(div_4);

			$.reset(div_2);
			$.reset(div_1);

			$.template_effect(() => {
				$.set_text(text_2, `${$$props.data.flag ?? ''}
				${$$props.data.label ?? ''}`);

				$.set_text(text_3, `(${$$props.data.code ?? ''})`);
			});

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent_2); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}