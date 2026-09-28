import * as $ from 'svelte/internal/server';
import Breadcrumb from "carbon-components-svelte/Breadcrumb/Breadcrumb.svelte";

export default function Breadcrumb_skeleton_test($$renderer) {
	Breadcrumb($$renderer, { skeleton: true, count: 3 });
	$$renderer.push(`<!----> `);
	Breadcrumb($$renderer, { noTrailingSlash: true, skeleton: true, count: 5 });
	$$renderer.push(`<!---->`);
}