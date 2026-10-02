import 'svelte/internal/disclose-version';
import Studio from '@theatre/studio';
import { studio } from '../consts.js';
import * as $ from 'svelte/internal/client';
import { observe } from '@threlte/core';
import { writable } from 'svelte/store';

Studio.initialize();
studio.set(Studio);

export default function InnerStudio($$anchor, $$props) {
	$.push($$props, true);

	const hideStore = writable($$props.hide);

	$.user_effect(() => {
		hideStore.set($$props.hide);
	});

	observe.pre(() => [studio, hideStore], ([studio, hide]) => {
		if (hide) {
			studio?.ui.hide();
		} else {
			studio?.ui.restore();
		}

		return () => {
			studio?.ui.hide();
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}