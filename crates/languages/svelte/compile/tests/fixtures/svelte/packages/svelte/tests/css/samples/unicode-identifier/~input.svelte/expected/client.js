import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<div id="123" class="svelte-aov5ae"></div> <div id="line
break" class="svelte-aov5ae"></div> <div class="a🙂b svelte-aov5ae"></div> <div class="asdf svelte-aov5ae"></div> <div class="asdf svelte-aov5ae"></div> <div id="1" class="svelte-aov5ae"><span class="svelte-aov5ae"></span></div>`,
	1
);

export default function Input($$anchor) {
	var fragment = root();

	$.next(10);
	$.append($$anchor, fragment);
}