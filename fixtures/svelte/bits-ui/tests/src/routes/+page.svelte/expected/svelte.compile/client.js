import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComboboxSingleTest from "../tests/combobox/combobox-test.svelte";

export default function _page($$anchor) {
	ComboboxSingleTest($$anchor, {
		items: [{ value: "1", label: "1" }, { value: "2", label: "2" }]
	});
}