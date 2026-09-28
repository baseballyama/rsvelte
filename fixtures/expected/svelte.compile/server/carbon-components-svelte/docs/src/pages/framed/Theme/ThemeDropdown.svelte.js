import * as $ from 'svelte/internal/server';
import { Theme } from "carbon-components-svelte";

export default function ThemeDropdown($$renderer) {
	Theme($$renderer, { render: 'dropdown' });
}