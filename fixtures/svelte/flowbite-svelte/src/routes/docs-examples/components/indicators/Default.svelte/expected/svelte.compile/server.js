import * as $ from 'svelte/internal/server';
import { Indicator } from "flowbite-svelte";

export default function Default($$renderer) {
	Indicator($$renderer, { color: 'gray' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { color: 'secondary' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { color: 'orange' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { color: 'blue' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { color: 'green' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { color: 'red' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { color: 'purple' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { color: 'indigo' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { color: 'yellow' });
	$$renderer.push(`<!----> `);
	Indicator($$renderer, { color: 'teal' });
	$$renderer.push(`<!---->`);
}