import * as $ from 'svelte/internal/server';
import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";

export default function Checkbox_skeleton_test($$renderer) {
	Checkbox($$renderer, { skeleton: true, 'data-testid': 'checkbox-skeleton' });
}