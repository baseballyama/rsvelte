import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<d class="svelte-rofjrh"></d> <e class="svelte-rofjrh"></e> <f class="svelte-rofjrh"></f>`, 1);
var root_1 = $.from_html(`<x class="svelte-rofjrh"><y class="svelte-rofjrh"><z class="svelte-rofjrh"></z> <!></y></x> <c class="svelte-rofjrh"></c> <g class="svelte-rofjrh"><h class="svelte-rofjrh"><i class="svelte-rofjrh"></i></h></g> <j class="svelte-rofjrh"><k class="svelte-rofjrh"></k></j>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var x = $.first_child(fragment);
	var y = $.child(x);
	var node = $.sibling($.child(y), 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();

			$.next(4);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (foo) $$render(consequent);
		});
	}

	$.reset(y);
	$.reset(x);
	$.next(6);
	$.append($$anchor, fragment);
}