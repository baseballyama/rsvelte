import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './component.svelte';

export default function Main($$anchor) {
	Component($$anchor, { name: 'world' });
}