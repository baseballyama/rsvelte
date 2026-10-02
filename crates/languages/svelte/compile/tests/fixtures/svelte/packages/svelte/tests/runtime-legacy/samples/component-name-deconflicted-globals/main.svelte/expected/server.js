import * as $ from 'svelte/internal/server';
import Countdown from './Countdown.svelte';

export default function Main($$renderer) {
	Countdown($$renderer, { count: 5 });
}