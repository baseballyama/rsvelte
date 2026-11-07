import * as $ from 'svelte/internal/server';
import CheckboxTree from '$lib/components/ui/checkbox-tree.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_17($$renderer) {
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

	$$renderer.push(`<div class="space-y-3">`);

	{
		function renderNode(
			$$renderer,
			{ checked, children, id, indeterminate, label, onCheckedChange }
		) {
			$$renderer.push(`<div class="ms-6 flex items-center gap-2">`);
			Checkbox($$renderer, { id, checked, onCheckedChange, indeterminate });
			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: id,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(label)}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			if (children) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(children);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let child = each_array[$$index];

					$$renderer.push(`<div class="ms-6 space-y-3">`);
					renderNode($$renderer, child);
					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		CheckboxTree($$renderer, { tree: initialTree, renderNode, $$slots: { renderNode: true } });
	}

	$$renderer.push(`<!----></div>`);
}