import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

export default function Input($$anchor) {
	Component($$anchor, { flag: true });
}