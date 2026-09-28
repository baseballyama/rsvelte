import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Email from './Email.svelte';

export default function Main($$anchor) {
	Email($$anchor, { address: 'hello@example.com' });
}