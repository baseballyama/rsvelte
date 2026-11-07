import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Breadcrumb from "carbon-components-svelte/Breadcrumb/Breadcrumb.svelte";

export default function Breadcrumb_skeleton_sm_test($$anchor) {
	Breadcrumb($$anchor, { skeleton: true, size: 'sm', count: 2 });
}