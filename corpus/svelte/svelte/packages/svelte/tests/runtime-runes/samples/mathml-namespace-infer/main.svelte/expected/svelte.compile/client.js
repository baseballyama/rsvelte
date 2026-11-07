import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Wrapper from "./Wrapper.svelte";

var root = $.from_mathml(`<math><!></math>`);

export default function Main($$anchor) {
	var math = root();
	var node = $.child(math);

	Wrapper(node, {});
	$.reset(math);
	$.append($$anchor, math);
}