import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";

export default function Checkbox_skeleton_test($$anchor) {
	Checkbox($$anchor, { skeleton: true, 'data-testid': 'checkbox-skeleton' });
}