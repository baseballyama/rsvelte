import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	Child($$renderer, $.spread_props([undefined]));
}