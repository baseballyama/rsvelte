import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export const once_on_render_event = (renderer_component, event_name, callback, skip_frames = 0) => {
	let skip = 0;
	let remove_on_render_event = undefined;

	function check() {
		if (skip === skip_frames) {
			callback();

			if (remove_on_render_event) remove_on_render_event();

			remove_on_render_event = null;
			skip = 0;
		} else {
			skip++;
		}
	}

	remove_on_render_event = renderer_component.$on(event_name, check);
};

export default function RendererUtils($$anchor) {}