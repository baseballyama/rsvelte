import * as $ from 'svelte/internal/server';
import { one } from './Child.svelte';

export default function Main($$renderer) {
	one($$renderer);
}