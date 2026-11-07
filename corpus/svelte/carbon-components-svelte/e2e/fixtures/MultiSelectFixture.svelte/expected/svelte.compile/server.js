import * as $ from 'svelte/internal/server';
import { MultiSelect } from "carbon-components-svelte";

export default function MultiSelectFixture($$renderer) {
	const items = [
		{ id: "apple", text: "Apple" },
		{ id: "banana", text: "Banana" },
		{ id: "cherry", text: "Cherry" },
		{ id: "date", text: "Date" },
		{ id: "elderberry", text: "Elderberry" }
	];

	const itemsWithSelectAll = [
		{ id: "select-all", text: "All roles", isSelectAll: true },
		{ id: "editor", text: "Editor" },
		{ id: "owner", text: "Owner" },
		{ id: "uploader", text: "Uploader" },
		{ id: "reader", text: "Reader", disabled: true }
	];

	let selectedIds = [];
	let selectedRoleIds = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		MultiSelect($$renderer, {
			'data-testid': 'multiselect-fruits',
			labelText: 'Fruits',
			label: 'Choose fruits',
			items,
			filterable: true,
			placeholder: 'Filter fruits',
			get selectedIds() {
				return selectedIds;
			},

			set selectedIds($$value) {
				selectedIds = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		if (selectedIds.length > 0) {
			$$renderer.push(`<!--[0--><p data-testid="selected-count">Selected: ${$.escape(selectedIds.length)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		MultiSelect($$renderer, {
			'data-testid': 'multiselect-roles',
			labelText: 'Roles',
			label: 'Choose roles',
			items: itemsWithSelectAll,
			filterable: true,
			placeholder: 'Filter roles...',
			get selectedIds() {
				return selectedRoleIds;
			},

			set selectedIds($$value) {
				selectedRoleIds = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		if (selectedRoleIds.length > 0) {
			$$renderer.push(`<!--[0--><p data-testid="selected-roles-count">Selected roles: ${$.escape(selectedRoleIds.length)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}