import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import foo from './doesntexistyet';

export default function Unresolvedimport($$anchor) {
	foo;
}