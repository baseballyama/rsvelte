import * as $ from 'svelte/internal/server';

export default function Visualizer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { audio } = $$props;
		const audioCtx = new (window.AudioContext || window?.webkitAudioContext)();
		let audioSource = null;
		let isAnimating = true;
		let analyser;

		audio.play();
		audioSource = audioCtx.createMediaElementSource(audio);
		analyser = audioCtx.createAnalyser();
		audioSource.connect(analyser);
		analyser.connect(audioCtx.destination);
		analyser.fftSize = 128;

		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		let barWidth = 10;
		let bars = [];
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
				bars = [];
				analyser?.getByteFrequencyData(dataArray);

				for (let i = 0; i < bufferLength; i++) {
					let barHeight = dataArray[i];

					bars[i] = { height: barHeight, width: barWidth };
				}
			}

			if (isAnimating) {
				animationFrameId = requestAnimationFrame(animate);
			}
		}

		animate();

		audio.addEventListener('pause', function () {
			isAnimating = false;
			cancelAnimationFrame(animationFrameId);
		});

		// When audio is played, resume the animation
		audio.addEventListener('play', function () {
			isAnimating = true;
			animate();
		});

		$$renderer.push(`<div class="visualizer svelte-1d3zzc5"><!--[-->`);

		const each_array = $.ensure_array_like(bars);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let bar = each_array[i];

			if (bar) {
				$$renderer.push(`<!--[0--><div class="bar"${$.attr_style(`height:${$.stringify(100 * (bar.height / 255))}%; background: var(--primary); flex: 1 1 0;`)}></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}