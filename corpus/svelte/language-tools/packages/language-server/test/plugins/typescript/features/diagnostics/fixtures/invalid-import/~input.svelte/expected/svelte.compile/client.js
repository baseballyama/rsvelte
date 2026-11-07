import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InvalidImport from './doesnt-exist.svelte';
import ValidImport from './valid-import.svelte';

export default function Input($$anchor) {
	InvalidImport;
	ValidImport;
}