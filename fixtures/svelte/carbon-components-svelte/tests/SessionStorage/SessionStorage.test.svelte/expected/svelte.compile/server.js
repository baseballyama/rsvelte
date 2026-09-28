import * as $ from 'svelte/internal/server';
import SessionStorage from "carbon-components-svelte/SessionStorage/SessionStorage.svelte";

export default function SessionStorage_test($$renderer) {
	// Example values for testing
	const primitiveValue = "test-value";

	const objectValue = { theme: "dark", fontSize: 16 };

	$$renderer.push(`<div data-testid="default-storage">`);
	SessionStorage($$renderer, { value: primitiveValue });
	$$renderer.push(`<!----></div> <div data-testid="storage-object">`);
	SessionStorage($$renderer, { key: 'theme-settings', value: objectValue });
	$$renderer.push(`<!----></div>`);
}