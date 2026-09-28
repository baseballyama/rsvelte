import * as $ from 'svelte/internal/server';
import { Indicator } from "flowbite-svelte";

export default function Position($$renderer) {
	$$renderer.push(`<div class="borer relative h-56 w-56 rounded-lg border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">`);
	Indicator($$renderer, { placement: 'top-left', color: 'primary' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { placement: 'top-center', color: 'secondary' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { placement: 'top-right', color: 'orange' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { placement: 'center-left', color: 'green' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { placement: 'center', color: 'red' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { placement: 'center-right', color: 'purple' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { placement: 'bottom-left', color: 'indigo' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { placement: 'bottom-center', color: 'yellow' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { placement: 'bottom-right', color: 'teal' });
	$$renderer.push(`<!----></div>`);
}