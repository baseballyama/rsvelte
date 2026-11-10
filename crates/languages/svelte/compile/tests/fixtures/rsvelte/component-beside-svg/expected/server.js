import * as $ from 'svelte/internal/server';

import C from "./C.svelte";

export default function Component_beside_svg($$renderer) {
	C($$renderer, {});
	$$renderer.push(`<!----><svg>`);
	C($$renderer, {});
	$$renderer.push(`<!----><g></g></svg>`);
	C($$renderer, {});
	$$renderer.push(`<!---->`);
}
