import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Comp from './diagnostics-if-control-flow-imported.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(` <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let a = true;
	let b = undefined;
	let assignA = '';

	assignA;

	const aPromise = Promise.resolve(true);
	const store = writable(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_2();
			var text = $.first_child(fragment_1);
			var node_1 = $.sibling(text);

			$.each(node_1, 16, () => [true], $.index, ($$anchor, a, $$index, $$array) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, `${a === true}
        ${(assignA = a) ?? ''}`));

				$.append($$anchor, text_1);
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_3 = root();
					var node_3 = $.first_child(fragment_3);

					$.await(
						node_3,
						() => aPromise,
						($$anchor) => {
							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, b.a));
							$.append($$anchor, text_3);
						},
						($$anchor, b) => {
							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(b).a));
							$.append($$anchor, text_2);
						}
					);

					var text_4 = $.sibling(node_3);

					$.template_effect(() => $.set_text(text_4, ` ${b.a ?? ''}`));
					$.append($$anchor, fragment_3);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_6 = root_1();
					var text_5 = $.first_child(fragment_6);

					text_5.nodeValue = 'false ';

					var node_4 = $.sibling(text_5);

					Comp(node_4, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const b = $.derived(() => $$slotProps.b);

								$.next();

								var fragment_7 = root_1();
								var text_6 = $.first_child(fragment_7);
								var node_5 = $.sibling(text_6);

								{
									var consequent_1 = ($$anchor) => {
										var text_7 = $.text();

										$.template_effect(() => $.set_text(text_7, a === $.get(b)));
										$.append($$anchor, text_7);
									};

									var alternate = ($$anchor) => {
										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, a === $.get(b)));
										$.append($$anchor, text_8);
									};

									$.if(node_5, ($$render) => {
										if (typeof $.get(b) === 'boolean') $$render(consequent_1); else $$render(alternate, -1);
									});
								}

								$.template_effect(() => $.set_text(text_6, `${$.get(b).a ?? ''} `));
								$.append($$anchor, fragment_7);
							}
						}
					});

					$.append($$anchor, fragment_6);
				};

				$.if(node_2, ($$render) => {
					if (b) $$render(consequent); else $$render(alternate_1, -1);
				});
			}

			$.template_effect(() => $.set_text(text, `true
    ${(assignA = a) ?? ''} `));

			$.append($$anchor, fragment_1);
		};

		var alternate_3 = ($$anchor) => {
			var fragment_10 = $.comment();
			var node_6 = $.first_child(fragment_10);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_11 = $.comment();
					var node_7 = $.first_child(fragment_11);

					$.each(node_7, 16, () => [], $.index, ($$anchor, a, $$index_1, $$array_1) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $store() === a));
						$.append($$anchor, text_9);
					});

					$.append($$anchor, fragment_11);
				};

				var alternate_2 = ($$anchor) => {
					var text_10 = $.text();

					$.template_effect(() => $.set_text(text_10, $store() === a));
					$.append($$anchor, text_10);
				};

				$.if(node_6, ($$render) => {
					if (typeof $store() === 'string') $$render(consequent_3); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_10);
		};

		$.if(node, ($$render) => {
			if (typeof a === 'string') $$render(consequent_2); else $$render(alternate_3, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}