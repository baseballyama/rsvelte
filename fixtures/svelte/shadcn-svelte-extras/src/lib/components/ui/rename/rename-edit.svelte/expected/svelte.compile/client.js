import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { useRenameEdit } from './rename.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'children',
	'variant',
	'child'
]);

export default function Rename_edit($$anchor, $$props) {
	$.push($$props, true);

	const editState = useRenameEdit();

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'outline'),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ edit: editState.edit }));
			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			Button($$anchor, $.spread_props(
				{
					type: 'button',
					get onclick() {
						return editState.edit;
					},

					get variant() {
						return variant();
					}
				},
				() => rest,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_2 = $.first_child(fragment_3);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								$.snippet(node_3, () => $$props.children);
								$.append($$anchor, fragment_4);
							};

							var alternate = ($$anchor) => {
								var text = $.text('Edit');

								$.append($$anchor, text);
							};

							$.if(node_2, ($$render) => {
								if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				}
			));
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}