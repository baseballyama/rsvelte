import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><div class="example svelte-7vj7zx"><video class="svelte-7vj7zx"></video> <div class="controls svelte-7vj7zx"><button> </button> <span> </span> <input type="range" class="svelte-7vj7zx"/></div></div></div>`, 2);

export default function Video_bindings($$anchor) {
	let clip = 'https://5ad4a01a-eb56-49a7-b0a7-a9e4bed9c1aa.mdnplay.dev/shared-assets/videos/flower.webm';
	let currentTime = $.state(0);
	let duration = $.state(0);
	let paused = $.state(true);
	var div = root();
	var div_1 = $.child(div);
	var video = $.child(div_1);

	$.set_attribute(video, 'src', clip);

	var div_2 = $.sibling(video, 2);
	var button = $.child(div_2);
	var text = $.only_child(button, true);
	var span = $.sibling(button, 2);
	var text_1 = $.only_child(span);
	var input = $.sibling(span, 2);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'step', 0.1);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $.get(paused) ? '▶️' : '⏸️');
			$.set_text(text_1, `${$0 ?? ''}/${$1 ?? ''}`);
			$.set_attribute(input, 'max', $.get(duration));
		},
		[
			() => $.get(currentTime).toFixed(1),
			() => $.get(duration).toFixed(1)
		]
	);

	$.bind_current_time(video, () => $.get(currentTime), ($$value) => $.set(currentTime, $$value));
	$.bind_property('duration', 'durationchange', video, ($$value) => $.set(duration, $$value));
	$.bind_paused(video, () => $.get(paused), ($$value) => $.set(paused, $$value));
	$.delegated('click', button, () => $.set(paused, !$.get(paused)));
	$.bind_value(input, () => $.get(currentTime), ($$value) => $.set(currentTime, $$value));
	$.append($$anchor, div);
}

$.delegate(['click']);