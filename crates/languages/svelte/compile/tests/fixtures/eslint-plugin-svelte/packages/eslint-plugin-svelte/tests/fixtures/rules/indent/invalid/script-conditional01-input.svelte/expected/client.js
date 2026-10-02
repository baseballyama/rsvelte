import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_conditional01_input($$anchor) {
	a = b ? c : d;
	a = b ? c : d;
	a = b ? c : d;
	a = b ? c : d ? e : f;
	a = b ? c ? d : e : e;
	a = b ? c : d ? e : f ? g : h;
}