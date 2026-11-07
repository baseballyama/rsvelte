import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="bar"></div>`);
var root_1 = $.from_html(`<div class="visualizer svelte-1d3zzc5"></div>`);

export default function Visualizer($$anchor, $$props) {
	$.push($$props, true);

	const audioCtx = new (window.AudioContext || window?.webkitAudioContext)();
	let audioSource = null;
	let isAnimating = true;
	let analyser;

	$$props.audio.play();
	audioSource = audioCtx.createMediaElementSource($$props.audio);
	analyser = audioCtx.createAnalyser();
	audioSource.connect(analyser);
	analyser.connect(audioCtx.destination);
	analyser.fftSize = 128;

	const bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);
	let barWidth = 10;
	let bars = $.state($.proxy([]));
	let animationFrameId;
	let fps = 30; // desired FPS
	let now;
	let then = Date.now();
	let interval = 1000 / fps;
	let delta;

	function animate() {
		now = Date.now();
		delta = now - then;

		if (delta > interval) {
			then = now - delta % interval;
			$.set(bars, [], true);
			analyser?.getByteFrequencyData(dataArray);

			for (let i = 0; i < bufferLength; i++) {
				let barHeight = dataArray[i];

				$.get(bars)[i] = { height: barHeight, width: barWidth };
			}
		}

		if (isAnimating) {
			animationFrameId = requestAnimationFrame(animate);
		}
	}

	animate();

	$$props.audio.addEventListener('pause', function () {
		isAnimating = false;
		cancelAnimationFrame(animationFrameId);
	});

	// When audio is played, resume the animation
	$$props.audio.addEventListener('play', function () {
		isAnimating = true;
		animate();
	});

	var div = root_1();

	$.each(div, 23, () => $.get(bars), (bar, i) => `bar-${i}`, ($$anchor, bar) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div_1 = root();

				$.template_effect(() => $.set_style(div_1, `height:${100 * ($.get(bar).height / 255)}%; background: var(--primary); flex: 1 1 0;`));
				$.append($$anchor, div_1);
			};

			$.if(node, ($$render) => {
				if ($.get(bar)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}