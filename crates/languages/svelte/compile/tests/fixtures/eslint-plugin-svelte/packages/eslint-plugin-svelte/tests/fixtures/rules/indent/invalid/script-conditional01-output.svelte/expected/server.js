import * as $ from 'svelte/internal/server';

export default function Script_conditional01_output($$renderer) {
	a = b ? c : d;
	a = b ? c : d;
	a = b ? c : d;
	a = b ? c : d ? e : f;
	a = b ? c ? d : e : e;
	a = b ? c : d ? e : f ? g : h;
}