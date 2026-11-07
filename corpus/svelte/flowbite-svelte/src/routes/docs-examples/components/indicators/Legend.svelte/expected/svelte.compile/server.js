import * as $ from 'svelte/internal/server';
import { Indicator } from "flowbite-svelte";

export default function Legend($$renderer) {
	$$renderer.push(`<span class="flex items-center">`);
	Indicator($$renderer, { size: 'sm', color: 'orange', class: 'me-1.5' });
	$$renderer.push(`<!---->Visitors</span> <span class="flex items-center">`);
	Indicator($$renderer, { size: 'sm', color: 'purple', class: 'me-1.5' });
	$$renderer.push(`<!---->Sessions</span> <span class="flex items-center">`);
	Indicator($$renderer, { size: 'sm', color: 'indigo', class: 'me-1.5' });
	$$renderer.push(`<!---->Customers</span> <span class="flex items-center">`);
	Indicator($$renderer, { size: 'sm', color: 'teal', class: 'me-1.5' });
	$$renderer.push(`<!---->Revenue</span>`);
}