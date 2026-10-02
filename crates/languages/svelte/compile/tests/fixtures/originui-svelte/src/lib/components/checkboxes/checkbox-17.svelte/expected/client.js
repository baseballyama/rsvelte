import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckboxTree from '$lib/components/ui/checkbox-tree.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="ms-6 space-y-3"><!></div>`);
var root_1 = $.from_html(`<div class="ms-6 flex items-center gap-2"><!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-3"><!></div>`);

export default function Checkbox_17($$anchor) {
	const initialTree = {
		children: [
			{
				defaultChecked: true,
				id: 'mountains',
				indeterminate: true,
				label: 'Mountains'
			},

			{
				children: [
					{ id: 'niagara', label: 'Niagara Falls' },
					{
						defaultChecked: true,
						id: 'angel-falls',
						label: 'Angel Falls'
					}
				],
				id: 'waterfalls',
				indeterminate: true,
				label: 'Waterfalls'
			},
			{ id: 'grand-canyon', label: 'Grand Canyon' }
		],
		id: 'natural-wonders',
		label: 'Natural Wonders'
	};

	var div = root_2();
	var node = $.child(div);

	{
		const renderNode = ($$anchor, $$arg0) => {
			let checked = () => ($$arg0?.()).checked;
			let children = () => ($$arg0?.()).children;
			let id = () => ($$arg0?.()).id;
			let indeterminate = () => ($$arg0?.()).indeterminate;
			let label = () => ($$arg0?.()).label;
			let onCheckedChange = () => ($$arg0?.()).onCheckedChange;
			var fragment = root_1();
			var div_1 = $.first_child(fragment);
			var node_1 = $.child(div_1);

			Checkbox(node_1, {
				get id() {
					return id();
				},

				get checked() {
					return checked();
				},

				get onCheckedChange() {
					return onCheckedChange();
				},

				get indeterminate() {
					return indeterminate();
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Label(node_2, {
				get for() {
					return id();
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, label()));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_4 = $.first_child(fragment_2);

					$.each(node_4, 17, children, (child) => child.id, ($$anchor, child) => {
						var div_2 = root();
						var node_5 = $.child(div_2);

						renderNode(node_5, () => $.get(child));
						$.reset(div_2);
						$.append($$anchor, div_2);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if (children()) $$render(consequent);
				});
			}

			$.append($$anchor, fragment);
		};

		CheckboxTree(node, {
			get tree() {
				return initialTree;
			},
			renderNode,
			$$slots: { renderNode: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}