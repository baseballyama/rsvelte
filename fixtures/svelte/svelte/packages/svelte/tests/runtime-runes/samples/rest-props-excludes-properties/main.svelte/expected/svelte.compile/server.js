import * as $ from 'svelte/internal/server';
import Component from './component.svelte';

export default function Main($$renderer) {
	Component($$renderer, { name: 'world' });
}