import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Caminandes: Llamigos</h1> <p>From <a href="https://cloud.blender.org/open-projects">Blender Open Projects</a>. CC-BY</p> <div class="svelte-1wdmrcy"><video poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg" src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4" class="svelte-1wdmrcy"><track kind="captions"/></video> <div class="controls svelte-1wdmrcy"><progress class="svelte-1wdmrcy"></progress> <div class="info svelte-1wdmrcy"><span class="time svelte-1wdmrcy"> </span> <span class="svelte-1wdmrcy"> </span> <span class="time svelte-1wdmrcy"> </span></div></div></div>`, 3);

export default function Media_elements_input($$anchor, $$props) {
	$.push($$props, true);

	// These values are bound to properties of the video
	let time = 0;

	let duration;
	let paused = true;
	let showControls = true;
	let showControlsTimeout;

	function handleMousemove(e) {
		// Make the controls visible, but fade out after
		// 2.5 seconds of inactivity
		clearTimeout(showControlsTimeout);

		showControlsTimeout = setTimeout(() => showControls = false, 2500);
		showControls = true;

		if (!(e.buttons & 1)) return; // mouse not down
		if (!duration) return; // video not loaded yet

		const { left, right } = this.getBoundingClientRect();

		time = duration * (e.clientX - left) / (right - left);
	}

	function handleMousedown(e) {
		// we can't rely on the built-in click event, because it fires
		// after a drag — we have to listen for clicks ourselves
		function handleMouseup() {
			if (paused) e.target.play(); else e.target.pause();

			cancel();
		}

		function cancel() {
			e.target.removeEventListener('mouseup', handleMouseup);
		}

		e.target.addEventListener('mouseup', handleMouseup);
		setTimeout(cancel, 200);
	}

	function format(seconds) {
		if (isNaN(seconds)) return '...';

		const minutes = Math.floor(seconds / 60);

		seconds = Math.floor(seconds % 60);

		if (seconds < 10) seconds = '0' + seconds;

		return `${minutes}:${seconds}`;
	}

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 4);
	var video = $.child(div);
	var div_1 = $.sibling(video, 2);
	var progress = $.child(div_1);
	var div_2 = $.sibling(progress, 2);
	var span = $.child(div_2);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1);
	var span_2 = $.sibling(span_1, 2);
	var text_2 = $.only_child(span_2, true);

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_style(div_1, `opacity: ${duration && showControls ? 1 : 0}`);
			$.set_value(progress, time / duration || 0);
			$.set_text(text, $0);
			$.set_text(text_1, `click anywhere to ${paused ? 'play' : 'pause'} / drag to seek`);
			$.set_text(text_2, $1);
		},
		[() => format(time), () => format(duration)]
	);

	$.event('mousemove', video, handleMousemove);
	$.event('mousedown', video, handleMousedown);
	$.bind_current_time(video, () => time, ($$value) => time = $$value);
	$.bind_property('duration', 'durationchange', video, ($$value) => duration = $$value);
	$.bind_paused(video, () => paused, ($$value) => paused = $$value);
	$.append($$anchor, fragment);
	$.pop();
}