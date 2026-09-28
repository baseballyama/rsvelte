import * as $ from 'svelte/internal/server';
import BadgeIndicator from "carbon-components-svelte/BadgeIndicator/BadgeIndicator.svelte";

export default function BadgeIndicator_test($$renderer) {
	$$renderer.push(`<div data-testid="dot">`);
	BadgeIndicator($$renderer, {});
	$$renderer.push(`<!----></div> <div data-testid="zero">`);
	BadgeIndicator($$renderer, { count: 0 });
	$$renderer.push(`<!----></div> <div data-testid="count">`);
	BadgeIndicator($$renderer, { count: 4 });
	$$renderer.push(`<!----></div> <div data-testid="overflow">`);
	BadgeIndicator($$renderer, { count: 1000 });
	$$renderer.push(`<!----></div> <div data-testid="boundary">`);
	BadgeIndicator($$renderer, { count: 999 });
	$$renderer.push(`<!----></div> <div data-testid="label">`);
	BadgeIndicator($$renderer, { count: '1.2k' });
	$$renderer.push(`<!----></div> <div data-testid="restprops">`);
	BadgeIndicator($$renderer, { id: 'notifications', class: 'custom' });
	$$renderer.push(`<!----></div>`);
}