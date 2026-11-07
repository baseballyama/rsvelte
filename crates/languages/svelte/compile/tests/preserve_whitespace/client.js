import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`

<p> </p>
  <span> b </span>

<button>  inc  </button>`, 1);

export default function App($$anchor) {
	let n = $.state(1);
	$.next();
	var fragment = root();
	var p = $.sibling($.first_child(fragment));
	var text = $.only_child(p);
	var button = $.sibling(p, 4);
	$.template_effect(() => $.set_text(text, `
	  a   ${$.get(n) ?? ''}

`));
	$.delegated('click', button, () => $.update(n));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
