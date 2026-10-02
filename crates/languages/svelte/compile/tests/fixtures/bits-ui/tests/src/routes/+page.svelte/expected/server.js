import * as $ from 'svelte/internal/server';
import ComboboxSingleTest from "../tests/combobox/combobox-test.svelte";

export default function _page($$renderer) {
	ComboboxSingleTest($$renderer, {
		items: [{ value: "1", label: "1" }, { value: "2", label: "2" }]
	});
}