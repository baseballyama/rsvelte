import * as $ from 'svelte/internal/server';
import Email from './Email.svelte';

export default function Main($$renderer) {
	Email($$renderer, { address: 'hello@example.com' });
}