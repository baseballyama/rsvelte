import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Comp from './diagnostics-if-control-flow-imported.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(` <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let a = true;
	let b = undefined;
	let assignA = '';

	assignA;

	const aPromise = Promise.resolve(true);
	const aNestedPromise = null;
	const store = writable(true);
	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_2();
			var text = $.first_child(fragment_1);
			var node_1 = $.sibling(text);

			$.each(
				node_1,
				16,
				() => [],
				$.index,
				($$anchor, foo) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, `true
        ${(assignA = a) ?? ''}
        ${foo ?? ''}`));

					$.append($$anchor, text_1);
				},
				($$anchor) => {
					$.next();

					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, `true
        ${(assignA = a) ?? ''}`));

					$.append($$anchor, text_2);
				}
			);

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_4 = root();
					var node_3 = $.first_child(fragment_4);

					$.await(
						node_3,
						() => aPromise,
						($$anchor) => {
							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, b.a));
							$.append($$anchor, text_4);
						},
						($$anchor, x) => {
							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, b.a === $.get(x)));
							$.append($$anchor, text_3);
						}
					);

					var text_5 = $.sibling(node_3);

					$.template_effect(() => $.set_text(text_5, ` ${b.a ?? ''}`));
					$.append($$anchor, fragment_4);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_7 = root_1();
					var text_6 = $.first_child(fragment_7);

					text_6.nodeValue = 'false ';

					var node_4 = $.sibling(text_6);

					Comp(node_4, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const foo = $.derived(() => $$slotProps.foo);

								$.next();

								var fragment_8 = root_1();
								var text_7 = $.first_child(fragment_8);
								var node_5 = $.sibling(text_7);

								{
									var consequent_1 = ($$anchor) => {
										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, $.get(foo) === a));
										$.append($$anchor, text_8);
									};

									var alternate = ($$anchor) => {
										var text_9 = $.text();

										$.template_effect(() => $.set_text(text_9, $.get(foo) === a));
										$.append($$anchor, text_9);
									};

									$.if(node_5, ($$render) => {
										if (typeof $.get(foo) === 'boolean') $$render(consequent_1); else $$render(alternate, -1);
									});
								}

								$.template_effect(() => $.set_text(text_7, `${b.a === $.get(foo)} `));
								$.append($$anchor, fragment_8);
							}
						}
					});

					$.append($$anchor, fragment_7);
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
			var fragment_11 = $.comment();
			var node_6 = $.first_child(fragment_11);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_12 = $.comment();
					var node_7 = $.first_child(fragment_12);

					$.each(node_7, 16, () => [], $.index, ($$anchor, foo) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, `${$store() === a}
            ${foo ?? ''}`));

						$.append($$anchor, text_10);
					});

					$.append($$anchor, fragment_12);
				};

				var alternate_2 = ($$anchor) => {
					var text_11 = $.text();

					$.template_effect(() => $.set_text(text_11, $store() === a));
					$.append($$anchor, text_11);
				};

				$.if(node_6, ($$render) => {
					if (typeof $store() === 'string') $$render(consequent_3); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_11);
		};

		$.if(node, ($$render) => {
			if (typeof a === 'string') $$render(consequent_2); else $$render(alternate_3, -1);
		});
	}

	var text_12 = $.sibling(node);
	var node_8 = $.sibling(text_12);

	$.await(node_8, () => aNestedPromise.p, null, ($$anchor, x) => {
		var text_13 = $.text();

		$.template_effect(() => $.set_text(text_13, $.get(x)));
		$.append($$anchor, text_13);
	});

	var node_9 = $.sibling(node_8, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_16 = $.comment();
			var node_10 = $.first_child(fragment_16);

			$.await(node_10, () => aNestedPromise.p, null, ($$anchor, x) => {
				var text_14 = $.text();

				$.template_effect(() => $.set_text(text_14, $.get(x)));
				$.append($$anchor, text_14);
			});

			$.append($$anchor, fragment_16);
		};

		$.if(node_9, ($$render) => {
			if (aNestedPromise) $$render(consequent_4);
		});
	}

	$.template_effect(() => $.set_text(text_12, ` true
${(assignA = a) ?? ''} `));

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}