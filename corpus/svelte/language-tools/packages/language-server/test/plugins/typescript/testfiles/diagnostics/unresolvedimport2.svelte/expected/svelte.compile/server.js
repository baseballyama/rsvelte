import * as $ from 'svelte/internal/server';
import foo from './doesntexistyet.svelte';

export default function Unresolvedimport2($$renderer) {
	foo;
}