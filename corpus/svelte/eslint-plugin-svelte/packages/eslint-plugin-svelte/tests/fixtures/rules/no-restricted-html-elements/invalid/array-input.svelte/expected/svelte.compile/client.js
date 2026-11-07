import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Main Title - H1</h1> <h2>Subtitle - H2</h2> <h3>Subsection Title - H3</h3> <h4>Sub-Subsection Title - H4</h4> <h5>Minor Title - H5</h5> <h6>Minor Subtitle - H6</h6>`, 1);

export default function Array_input($$anchor) {
	var fragment = root();

	$.next(10);
	$.append($$anchor, fragment);
}