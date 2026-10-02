import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

export default function Main($$anchor) {
	Component($$anchor, { value: '10px' });
}