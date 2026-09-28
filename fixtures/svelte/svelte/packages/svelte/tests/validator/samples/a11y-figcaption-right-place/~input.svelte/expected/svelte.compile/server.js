import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<figure><img src="foo.jpg" alt="a foo"/> <figcaption>a foo in its natural habitat</figcaption></figure>`);
}