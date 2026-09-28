import * as $ from 'svelte/internal/server';
import Breadcrumb from "carbon-components-svelte/Breadcrumb/Breadcrumb.svelte";

export default function Breadcrumb_skeleton_sm_test($$renderer) {
	Breadcrumb($$renderer, { skeleton: true, size: 'sm', count: 2 });
}