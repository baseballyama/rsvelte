import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const outer = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

export { outer };

var root = $.from_html(`<p class="inner svelte-19s05cs"></p>`);

export default function Input($$anchor) {}