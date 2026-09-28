import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BROWSER } from 'esm-env';
import { getPreviewLevel } from '../contexts.js';
import Expandable from './Expandable.svelte';
import FunctionBody from './FunctionBody.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'type',
	'path'
]);

var root = $.from_html(`<span class="preview value function svelte-fxbdh5"> </span>`);

export default function FunctionView($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let isMultiLine = $.derived(() => $$props.value.toString().includes('\n'));
	const previewLevel = getPreviewLevel();

	const oneLine = $.derived(() => {
		switch ($$props.type) {
			case 'asyncfunction':
				return $$props.value.toString().replace('async', '');

			case 'generatorfunction':
				return $$props.value.toString().replace('function*', '').replace('*', '');

			case 'asyncgeneratorfunction':
				return $$props.value.toString().replace('async', '').replace('function*', '').replace('*', '');
		}

		return $$props.value.toString();
	});

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text = $.only_child(span, true);

					$.template_effect(() => {
						$.set_attribute(span, 'title', $$props.value.name);
						$.set_text(text, $$props.value.name);
					});

					$.append($$anchor, span);
				};

				var consequent_1 = ($$anchor) => {
					FunctionBody($$anchor, {
						get value() {
							return $.get(oneLine);
						},
						inline: true
					});
				};

				var consequent_2 = ($$anchor) => {
					FunctionBody($$anchor, {
						get value() {
							return $.get(oneLine);
						},
						inline: true
					});
				};

				$.if(node, ($$render) => {
					if (previewLevel) $$render(consequent); else if (showPreview() && $.get(isMultiLine) && BROWSER) $$render(consequent_1, 1); else if (BROWSER && !$.get(isMultiLine)) $$render(consequent_2, 2);
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => $.get(isMultiLine) ? 1 : 0);

		Expandable($$anchor, $.spread_props(
			{
				get key() {
					return $$props.key;
				},

				get type() {
					return $$props.type;
				},

				get path() {
					return $$props.path;
				},

				get value() {
					return $$props.value;
				},

				get length() {
					return $.get($0);
				},
				showLength: false
			},
			() => rest,
			{
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_1 = $.first_child(fragment_4);

					{
						var consequent_3 = ($$anchor) => {
							{
								let $0 = $.derived(() => $$props.value.toString());

								FunctionBody($$anchor, {
									get value() {
										return $.get($0);
									}
								});
							}
						};

						$.if(node_1, ($$render) => {
							if ($.get(isMultiLine)) $$render(consequent_3);
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { valuePreview: true, default: true }
			}
		));
	}

	$.pop();
}