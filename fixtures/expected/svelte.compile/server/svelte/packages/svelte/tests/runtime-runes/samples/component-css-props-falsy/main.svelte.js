import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	$.css_props($$renderer, true, { '--zero': 0, '--one': 1, '--empty': '', '--nullish': null }, () => {
		Component($$renderer, {});
	});
}