import * as $ from 'svelte/internal/server';
import { MultiSelect } from "carbon-components-svelte";

export default function MultiSelectSelectAll($$renderer) {
	MultiSelect($$renderer, {
		filterable: true,
		labelText: 'Roles',
		placeholder: 'Filter roles...',
		items: [
			{ id: "select-all", text: "All roles", isSelectAll: true },
			{ id: "editor", text: "Editor" },
			{ id: "owner", text: "Owner" },
			{ id: "uploader", text: "Uploader" },
			{ id: "reader", text: "Reader", disabled: true }
		]
	});
}