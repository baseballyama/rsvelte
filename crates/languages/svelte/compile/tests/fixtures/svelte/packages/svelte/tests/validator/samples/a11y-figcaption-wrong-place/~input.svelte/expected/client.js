import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<figure><img src="foo.jpg" alt="a foo"/> <figcaption>a foo in its natural habitat</figcaption> <p>this should not be here</p></figure> <figure><img src="foo.jpg" alt="a foo"/> <div class="markup-for-styling"><figcaption>this element should be a child of the figure</figcaption></div></figure>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}