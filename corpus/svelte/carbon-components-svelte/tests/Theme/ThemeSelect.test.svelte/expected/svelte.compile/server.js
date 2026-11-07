import * as $ from 'svelte/internal/server';
import Theme from "carbon-components-svelte/Theme/Theme.svelte";

export default function ThemeSelect_test($$renderer) {
	Theme($$renderer, { render: 'select' });
}