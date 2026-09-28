import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div style="display: flex; gap: 10px; flex-direction: column; font-family: monospace; justify-items: flex-start; align-content: flex-start; width: min-content;"><div>window.requestAnimationFrame</div> <button> </button></div>`);

export default function ReqAnim($$anchor, $$props) {
	$.push($$props, true);

	const originalRaf = typeof window !== 'undefined' ? window.requestAnimationFrame : () => -1;
	let isPaused = $.state(false);
	let pendingCallbacks = [];

	const monkeyPatchedRaf = (callback) => {
		if ($.get(isPaused)) {
			pendingCallbacks.push(callback);

			return -1; // Return an invalid ID when paused
		} else {
			return originalRaf(callback);
		}
	};

	const pauseRaf = () => {
		if (!$.get(isPaused)) {
			$.set(isPaused, true);
		}
	};

	const resumeRaf = () => {
		if ($.get(isPaused)) {
			$.set(isPaused, false);
			pendingCallbacks.forEach((callback) => originalRaf(callback));
			pendingCallbacks = [];
		}
	};

	onMount(() => {
		// Monkeypatch the window.requestAnimationFrame
		window.requestAnimationFrame = monkeyPatchedRaf;
	});

	var div = root();
	var button = $.sibling($.child(div), 2);
	var text = $.only_child(button, true);

	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(isPaused) ? 'Resume' : 'Pause'));

	$.delegated('click', button, () => {
		if ($.get(isPaused)) {
			resumeRaf();
		} else {
			pauseRaf();
		}
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);