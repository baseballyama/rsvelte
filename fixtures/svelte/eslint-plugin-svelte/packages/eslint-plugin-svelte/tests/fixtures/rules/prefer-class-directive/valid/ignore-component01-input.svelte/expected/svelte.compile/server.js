import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Ignore_component01_input($$renderer) {
	let current = 'foo';

	Component($$renderer, { class: current === 'foo' ? 'selected' : '' });
}