import * as $ from 'svelte/internal/server';
import foo from './doesntexistyet';

export default function Unresolvedimport($$renderer) {
	foo;
}