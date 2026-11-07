import * as $ from 'svelte/internal/server';
import Parent from './Parent.svelte';

export default function Main($$renderer) {
	Parent($$renderer, {});
}