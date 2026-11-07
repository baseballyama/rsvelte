import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

export default function Bindable($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		$$props.onRefCreate($.get(ref));
	});

	T($$anchor, {
		get is() {
			return $$props.is;
		},

		get ref() {
			return $.get(ref);
		},

		set ref($$value) {
			$.set(ref, $$value);
		}
	});

	$.pop();
}