import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Global_on_forward($$anchor, $$props) {
	$.event('resize', $.window, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});
	$.event('visibilitychange', $.document, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});
}
