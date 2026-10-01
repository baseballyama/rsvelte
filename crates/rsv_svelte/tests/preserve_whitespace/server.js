import * as $ from 'svelte/internal/server';

export default function App($$renderer) {
	let n = 1;
	$$renderer.push(`<!---->

<p>
	  a   ${$.escape(n)}

</p>
  <span> b </span>

<button>  inc  </button>`);
}
