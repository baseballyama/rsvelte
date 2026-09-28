import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Copy from '$doclib/icons/Copy.svelte';
import Inspect from '$lib/Inspect.svelte';
import { getContext } from 'svelte';
import { fly } from 'svelte/transition';
import { highlight } from './shiki.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'code',
	'label',
	'language',
	'children'
]);

var root = $.from_html(`<!> <button>retry</button>`, 1);
var root_1 = $.from_html(`<div class="label svelte-1g6xvrs"> </div>`);
var root_2 = $.from_html(`<div></div>`);
var root_3 = $.from_html(`<div><div class="util svelte-1g6xvrs"><!> <button title="copy code"><!></button></div> <!></div>`);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, 'example'),
		language = $.prop($$props, 'language', 3, 'svelte'),
		rest = $.rest_props($$props, rest_excludes);

	const multi = getContext('multi');
	let highlighted = $.derived(() => $$props.children ? undefined : highlight($$props.code, language()));
	let copied = $.state(false);
	let timeout;

	async function copyCode() {
		try {
			await navigator.clipboard.writeText($$props.code);
			$.set(copied, true);

			if (timeout) window.clearTimeout(timeout);

			timeout = window.setTimeout(
				() => {
					$.set(copied, false);
				},
				5000
			);
		} catch(e) {
			console.error(e);
			$.set(copied, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, error = $.noop, reset = $.noop) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Inspect(node_1, {
				get value() {
					return error();
				}
			});

			var button = $.sibling(node_1, 2);

			$.delegated('click', button, function (...$$args) {
				reset()?.apply(this, $$args);
			});

			$.append($$anchor, fragment_1);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			var div = root_3();

			$.attribute_effect(div, () => ({ class: 'code', ...rest, [$.CLASS]: { multi } }), void 0, void 0, void 0, 'svelte-1g6xvrs');

			var div_1 = $.child(div);
			var node_2 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					var div_2 = root_1();
					var text = $.only_child(div_2, true);

					$.template_effect(() => $.set_text(text, label()));
					$.append($$anchor, div_2);
				};

				$.if(node_2, ($$render) => {
					if (label()) $$render(consequent);
				});
			}

			var button_1 = $.sibling(node_2, 2);
			let classes;
			var node_3 = $.child(button_1);

			Copy(node_3, {});
			$.reset(button_1);
			$.reset(div_1);

			var node_4 = $.sibling(div_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_5 = $.first_child(fragment_2);

					$.snippet(node_5, () => $$props.children);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_6 = $.first_child(fragment_3);

					$.await(
						node_6,
						() => $.get(highlighted),
						($$anchor) => {
							var text_1 = $.text('...');

							$.append($$anchor, text_1);
						},
						($$anchor, result) => {
							var div_3 = root_2();

							$.html(div_3, () => $.get(result), true);
							$.reset(div_3);
							$.transition(1, div_3, () => fly, () => ({ x: -10 }));
							$.append($$anchor, div_3);
						}
					);

					$.append($$anchor, fragment_3);
				};

				$.if(node_4, ($$render) => {
					if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(div);
			$.template_effect(() => classes = $.set_class(button_1, 1, 'svelte-1g6xvrs', null, classes, { copied: $.get(copied) }));
			$.delegated('click', button_1, copyCode);
			$.append($$anchor, div);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);