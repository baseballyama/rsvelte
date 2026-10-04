import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Global_on_modifiers($$anchor) {
	$.event('click', $.window, $.once($.preventDefault(() => {})));
	$.event('touchmove', $.document, () => {}, void 0, false);
	$.event('keydown', $.document.body, $.trusted($.self(() => {})), true);
}
