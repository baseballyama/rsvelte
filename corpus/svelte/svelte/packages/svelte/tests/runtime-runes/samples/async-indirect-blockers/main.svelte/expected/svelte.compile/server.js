import * as $ from 'svelte/internal/server';
import Component1 from './Component1.svelte';
import Component2 from './Component2.svelte';
import Component3 from './Component3.svelte';
import Component4 from './Component4.svelte';

export default function Main($$renderer) {
	Component1($$renderer, {});
	$$renderer.push(`<!----> `);
	Component2($$renderer, {});
	$$renderer.push(`<!----> `);
	Component3($$renderer, {});
	$$renderer.push(`<!----> `);
	Component4($$renderer, {});
	$$renderer.push(`<!---->`);
}