import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let name = '';

	$$renderer.push(`<pre>static content no line</pre> <pre>
	static content ignored line
</pre> <pre>

	static content relevant line
</pre> <pre><div><span></span></div>
</pre> <pre>

<div><span></span></div>
</pre>`);
}