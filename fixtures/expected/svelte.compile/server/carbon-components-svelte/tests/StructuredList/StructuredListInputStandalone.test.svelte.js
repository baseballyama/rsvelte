import * as $ from 'svelte/internal/server';
import StructuredListInput from "carbon-components-svelte/StructuredList/StructuredListInput.svelte";

export default function StructuredListInputStandalone_test($$renderer) {
	StructuredListInput($$renderer, { id: 'standalone', value: 'standalone-value', name: 'solo' });
}