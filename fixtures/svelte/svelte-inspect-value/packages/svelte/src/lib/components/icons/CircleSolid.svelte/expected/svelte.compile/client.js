import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scale } from 'svelte/transition';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"></path></svg>`);

export default function CircleSolid($$anchor) {
	var svg = root();

	$.transition(1, svg, () => scale, () => ({ opacity: 1 }));
	$.append($$anchor, svg);
}