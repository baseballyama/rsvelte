import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Theme } from "carbon-components-svelte";

export default function ThemeDropdown($$anchor) {
	Theme($$anchor, { render: 'dropdown' });
}