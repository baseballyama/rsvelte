import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<figure><img src="foo.jpg" alt="a foo"/> <figcaption>a foo in its natural habitat</figcaption> <p>this should not be here</p></figure> <figure><img src="foo.jpg" alt="a foo"/> <div class="markup-for-styling"><figcaption>this element should be a child of the figure</figcaption></div></figure>`);
}