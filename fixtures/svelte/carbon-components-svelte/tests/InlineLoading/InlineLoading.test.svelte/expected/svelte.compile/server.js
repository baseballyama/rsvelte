import * as $ from 'svelte/internal/server';
import InlineLoading from "carbon-components-svelte/InlineLoading/InlineLoading.svelte";

export default function InlineLoading_test($$renderer) {
	$$renderer.push(`<div data-testid="default-loader">`);
	InlineLoading($$renderer, {});
	$$renderer.push(`<!----></div> <div data-testid="loader-with-description">`);
	InlineLoading($$renderer, { description: 'Loading metrics...' });
	$$renderer.push(`<!----></div> <div data-testid="loader-active">`);
	InlineLoading($$renderer, { status: 'active', description: 'Submitting...' });
	$$renderer.push(`<!----></div> <div data-testid="loader-inactive">`);
	InlineLoading($$renderer, { status: 'inactive', description: 'Cancelling...' });
	$$renderer.push(`<!----></div> <div data-testid="loader-finished">`);
	InlineLoading($$renderer, { status: 'finished', description: 'Success' });
	$$renderer.push(`<!----></div> <div data-testid="loader-custom-success-delay">`);

	InlineLoading($$renderer, {
		status: 'finished',
		description: 'Processing...',
		successDelay: 500
	});

	$$renderer.push(`<!----></div> <div data-testid="loader-error">`);
	InlineLoading($$renderer, { status: 'error', description: 'An error occurred' });
	$$renderer.push(`<!----></div> <div data-testid="loader-custom-icon">`);

	InlineLoading($$renderer, {
		status: 'finished',
		description: 'Complete',
		iconDescription: 'Operation completed successfully'
	});

	$$renderer.push(`<!----></div>`);
}