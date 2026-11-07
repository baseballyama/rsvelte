import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`${$.html(myfile + someOtherFile)}`);
}