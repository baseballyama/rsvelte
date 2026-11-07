import * as $ from 'svelte/internal/server';
import InvalidImport from './doesnt-exist.svelte';
import ValidImport from './valid-import.svelte';

export default function Input($$renderer) {
	InvalidImport;
	ValidImport;
}