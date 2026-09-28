import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isMac } from '$lib/hooks/is-mac.svelte';
import * as Icons from '$lib/components/icons';

var root = $.from_html(`<div class="flex h-[264px] w-60 items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="flex flex-col items-center justify-center gap-2"><img src="/docs/microsoft.jpeg" alt="Windows" class="size-60 rounded-lg"/> <span class="text-muted-foreground text-xs">(sorry Linux users)</span></div>`);

export default function Is_mac($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.component(node_1, () => Icons.Apple, ($$anchor, Icons_Apple) => {
				Icons_Apple($$anchor, { class: 'size-10 rounded-lg' });
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (isMac) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}