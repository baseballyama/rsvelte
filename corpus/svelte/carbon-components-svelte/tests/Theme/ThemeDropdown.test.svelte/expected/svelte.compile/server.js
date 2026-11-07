import * as $ from 'svelte/internal/server';
import Theme from "carbon-components-svelte/Theme/Theme.svelte";

export default function ThemeDropdown_test($$renderer) {
	Theme($$renderer, { render: 'dropdown' });
}