import * as $ from 'svelte/internal/server';

export default function Pre($$renderer) {
	let text = 'hi';

	$$renderer.push(`<pre>
  a
	${$.escape(text)}
</pre> <pre>

two newlines</pre> <pre><code>  ${$.escape(text)}  </code></pre> <button type="button">more</button>`);
}