import * as $ from 'svelte/internal/server';
import Rename from './rename.svelte';
import Rename3 from './rename3.svelte';

export default function Rename2($$renderer) {
	Rename($$renderer, { exportedProp: 2 });
	$$renderer.push(`<!----> `);
	Rename3($$renderer, { exportedPropFromJs: 2 });
	$$renderer.push(`<!----> <div class="foo"></div>`);
}