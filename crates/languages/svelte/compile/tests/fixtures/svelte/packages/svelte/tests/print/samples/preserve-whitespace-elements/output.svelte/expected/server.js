import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	$.head('1ny1jwk', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>  hello
  world  </title>`);
		});
	});

	$$renderer.push(`<pre>

    hel

    lo
      .
</pre> <pre>  before
<span>  nested
 text  </span>
`);

	if (visible) {
		$$renderer.push(`<!--[0-->  conditional
 value`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></pre> <textarea>  first
    second  </textarea>`);
}