import * as $ from 'svelte/internal/server';
import { bar } from './foo.svelte';

export default function Input($$renderer) {
	bar;
}