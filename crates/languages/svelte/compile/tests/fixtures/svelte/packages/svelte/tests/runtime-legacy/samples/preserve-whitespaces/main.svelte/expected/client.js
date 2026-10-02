import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<pre id="pre">
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
  </pre></div>`,
	1
);

export default function Main($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}