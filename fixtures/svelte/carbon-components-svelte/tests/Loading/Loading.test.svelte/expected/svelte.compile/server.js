import * as $ from 'svelte/internal/server';
import Loading from "carbon-components-svelte/Loading/Loading.svelte";

export default function Loading_test($$renderer) {
	$$renderer.push(`<div data-testid="default-loader">`);
	Loading($$renderer, {});
	$$renderer.push(`<!----></div> <div data-testid="loader-no-overlay">`);
	Loading($$renderer, { withOverlay: false });
	$$renderer.push(`<!----></div> <div data-testid="loader-small">`);
	Loading($$renderer, { withOverlay: false, small: true });
	$$renderer.push(`<!----></div> <div data-testid="loader-inactive">`);
	Loading($$renderer, { active: false });
	$$renderer.push(`<!----></div> <div data-testid="loader-description">`);
	Loading($$renderer, { description: 'Processing data...' });
	$$renderer.push(`<!----></div>`);
}