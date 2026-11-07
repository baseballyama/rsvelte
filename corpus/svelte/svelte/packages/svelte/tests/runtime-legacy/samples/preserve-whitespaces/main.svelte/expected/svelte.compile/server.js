import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<pre id="pre">
  A
  B
  <span>
    C
    D
  </span>
  E
  F
</pre> <div id="div">A
  B <span>C
    D</span> E
  F</div> <div id="div-with-pre"><pre>
    A
    B
    <span>
      C
      D
    </span>
    E
    F
  </pre></div>`);
}