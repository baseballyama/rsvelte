import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProgressLinear from "components/ProgressLinear";
import ProgressCircular from "components/ProgressCircular";
import Code from "docs/Code.svelte";
import indicators from "examples/progress-indicators.txt";

var root = $.from_html(`<h5 class="pb-4">Indefinite linear progress indicator</h5> <!> <h5 class="pt-6 pb-4">Definite linear progress indicator</h5> <small class="mb-3"> </small> <!> <h5 class="pt-6 pb-4">Indefinite circular progress indicator</h5> <!> <h5 class="pt-6 pb-4">Definite circular progress indicator</h5> <small class="mb-3"> </small> <!> <!>`, 1);

export default function Progress_indicators($$anchor) {
	let progress = 0;

	function next() {
		setTimeout(
			() => {
				if (progress === 100) {
					progress = 0;
				}

				progress += 1;
				next();
			},
			100
		);
	}

	next();

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	ProgressLinear(node, {});

	var small = $.sibling(node, 4);
	var text = $.only_child(small);
	var node_1 = $.sibling(small, 2);

	ProgressLinear(node_1, {
		get progress() {
			return progress;
		}
	});

	var node_2 = $.sibling(node_1, 4);

	ProgressCircular(node_2, {});

	var small_1 = $.sibling(node_2, 4);
	var text_1 = $.only_child(small_1);
	var node_3 = $.sibling(small_1, 2);

	ProgressCircular(node_3, {
		get progress() {
			return progress;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Code(node_4, {
		get code() {
			return indicators;
		}
	});

	$.template_effect(() => {
		$.set_text(text, `${progress ?? ''}%`);
		$.set_text(text_1, `${progress ?? ''}%`);
	});

	$.append($$anchor, fragment);
}