import * as $ from 'svelte/internal/server';

export default function Media_elements_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<h1>Caminandes: Llamigos</h1> <p>From <a href="https://cloud.blender.org/open-projects">Blender Open Projects</a>. CC-BY</p> <div class="svelte-1wdmrcy"><video poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg" src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4" class="svelte-1wdmrcy"><track kind="captions"/></video> <div class="controls svelte-1wdmrcy"${$.attr_style(`opacity: ${$.stringify(duration && showControls ? 1 : 0)}`)}><progress${$.attr('value', time / duration || 0)} class="svelte-1wdmrcy"></progress> <div class="info svelte-1wdmrcy"><span class="time svelte-1wdmrcy">${$.escape(format(time))}</span> <span class="svelte-1wdmrcy">click anywhere to ${$.escape(paused ? 'play' : 'pause')} / drag to seek</span> <span class="time svelte-1wdmrcy">${$.escape(format(duration))}</span></div></div></div>`);
	});
}