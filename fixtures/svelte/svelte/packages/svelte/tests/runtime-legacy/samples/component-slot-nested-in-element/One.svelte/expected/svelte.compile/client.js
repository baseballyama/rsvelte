import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Two from './Two.svelte';

var root = $.from_html(`<div slot="b"><div><!></div></div>`);

export default function One($$anchor, $$props) {
	Two($$anchor, {
		$$slots: {
			b: ($$anchor, $$slotProps) => {
				var div = root();
				var div_1 = $.child(div);
				var node = $.child(div_1);

				$.slot(node, $$props, 'a', {}, null);
				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});
}