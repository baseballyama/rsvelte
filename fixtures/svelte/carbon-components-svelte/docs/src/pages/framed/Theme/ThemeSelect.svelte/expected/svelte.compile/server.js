import * as $ from 'svelte/internal/server';
import { Theme } from "carbon-components-svelte";

export default function ThemeSelect($$renderer) {
	Theme($$renderer, { render: 'select' });
}