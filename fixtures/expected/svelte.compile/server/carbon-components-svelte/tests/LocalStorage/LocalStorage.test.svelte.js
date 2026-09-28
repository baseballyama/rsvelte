import * as $ from 'svelte/internal/server';
import LocalStorage from "carbon-components-svelte/LocalStorage/LocalStorage.svelte";

export default function LocalStorage_test($$renderer) {
	// Example values for testing
	const primitiveValue = "test-value";

	const objectValue = { theme: "dark", fontSize: 16 };

	$$renderer.push(`<div data-testid="default-storage">`);
	LocalStorage($$renderer, { value: primitiveValue });
	$$renderer.push(`<!----></div> <div data-testid="storage-object">`);
	LocalStorage($$renderer, { key: 'theme-settings', value: objectValue });
	$$renderer.push(`<!----></div>`);
}