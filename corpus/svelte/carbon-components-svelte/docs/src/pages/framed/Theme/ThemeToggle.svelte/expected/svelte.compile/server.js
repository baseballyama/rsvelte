import * as $ from 'svelte/internal/server';
import { Theme } from "carbon-components-svelte";

export default function ThemeToggle($$renderer) {
	Theme($$renderer, { render: 'toggle' });
}