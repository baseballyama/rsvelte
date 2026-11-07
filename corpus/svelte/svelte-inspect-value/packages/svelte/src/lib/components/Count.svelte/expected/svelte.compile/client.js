import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Highlight from './Highlight.svelte';

var root = $.from_html(`<span class="unit"> </span>`);
var root_1 = $.from_html(`<!> <span> </span> <!>`, 1);
var root_2 = $.from_html(`<div data-testid="count" class="count svelte-qm7g4h"><!></div>`);

export default function Count($$anchor, $$props) {
	let prefix = $.derived(() => {
		switch ($$props.type) {
			case 'urlsearchparams':
				return 'size:';

			default:
				return '';
		}
	});

	let unit = $.derived(() => {
		switch ($$props.type) {
			case undefined:
				return;

			case 'urlsearchparams':
				return;

			case 'array':

			case 'int8array':

			case 'uint8array':

			case 'uint8clampedarray':

			case 'int16array':

			case 'uint16array':

			case 'int32array':

			case 'uint32array':

			case 'float32array':

			case 'float64array':

			case 'bigint64array':

			case 'biguint64array':
				return 'items';

			case 'string':
				return 'chars';

			default:
				return 'entries';
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var div = root_2();
			var node_1 = $.child(div);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_1 = root_1();
					var node_2 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var span = root();
							var text = $.only_child(span, true);

							$.template_effect(() => $.set_text(text, $.get(prefix)));
							$.append($$anchor, span);
						};

						$.if(node_2, ($$render) => {
							if ($.get(prefix)) $$render(consequent);
						});
					}

					var span_1 = $.sibling(node_2, 2);
					var text_1 = $.only_child(span_1, true);
					var node_3 = $.sibling(span_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							Highlight($$anchor, {
								class: 'unit',
								get value() {
									return $.get(unit);
								},
								fields: ['value']
							});
						};

						$.if(node_3, ($$render) => {
							if ($.get(unit)) $$render(consequent_1);
						});
					}

					$.template_effect(() => $.set_text(text_1, $$props.length));
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					Highlight($$anchor, { value: 'empty', fields: ['value'] });
				};

				$.if(node_1, ($$render) => {
					if ($$props.length > 0) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (typeof $$props.length === 'number') $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
}