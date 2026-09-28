import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPropertyDescriptor } from '../util.js';
import Entry from './Entry.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import NodeActionButton from './NodeActionButton.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function PropertyList($$anchor, $$props) {
	$.push($$props, true);

	let keys = $.prop($$props, 'keys', 19, () => []);
	const paging = 50;
	let max = $.state(paging);
	let slicedKeys = $.derived(() => keys().length > $.get(max) ? keys().slice(0, $.get(max)) : keys());
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 18, () => $.get(slicedKeys), (key) => key, ($$anchor, key, index) => {
		const descriptor = $.derived(() => getPropertyDescriptor($$props.value, key));

		Entry($$anchor, {
			get i() {
				return $.get(index);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_2 = $.first_child(fragment_3);

						$.snippet(node_2, () => $$props.item, () => ({ key, index: $.get(index), descriptor: $.get(descriptor) }));
						$.append($$anchor, fragment_3);
					};

					var consequent_1 = ($$anchor) => {
						GetterSetter($$anchor, {
							get value() {
								return $$props.value;
							},

							get descriptor() {
								return $.get(descriptor);
							},

							get key() {
								return key;
							},

							get path() {
								return $$props.path;
							}
						});
					};

					var alternate = ($$anchor) => {
						{
							let $0 = $.derived(() => $$props.value?.[key]);

							Node($$anchor, {
								get value() {
									return $.get($0);
								},

								get key() {
									return key;
								},

								get path() {
									return $$props.path;
								}
							});
						}
					};

					$.if(node_1, ($$render) => {
						if ($$props.item) $$render(consequent); else if ($.get(descriptor)?.get || $.get(descriptor)?.set) $$render(consequent_1, 1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			NodeActionButton($$anchor, {
				style: 'margin-left: 2em; text-align: center; margin-bottom: 0.5em; width: calc(100% - 5em)',
				onclick: () => {
					$.set(max, $.get(max) + paging);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} more`), [() => Math.abs($.get(max) - keys().length)]);
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_3, ($$render) => {
			if ($.get(slicedKeys).length < keys().length) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}