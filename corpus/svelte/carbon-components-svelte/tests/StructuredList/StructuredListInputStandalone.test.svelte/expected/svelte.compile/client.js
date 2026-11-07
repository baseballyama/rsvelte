import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import StructuredListInput from "carbon-components-svelte/StructuredList/StructuredListInput.svelte";

export default function StructuredListInputStandalone_test($$anchor) {
	StructuredListInput($$anchor, { id: 'standalone', value: 'standalone-value', name: 'solo' });
}