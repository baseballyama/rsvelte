import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Declaring_props01_input($$renderer) {
	Nested($$renderer, { answer: 42 });
}