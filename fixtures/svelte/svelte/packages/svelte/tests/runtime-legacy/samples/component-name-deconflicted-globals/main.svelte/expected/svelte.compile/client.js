import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Countdown from './Countdown.svelte';

export default function Main($$anchor) {
	Countdown($$anchor, { count: 5 });
}