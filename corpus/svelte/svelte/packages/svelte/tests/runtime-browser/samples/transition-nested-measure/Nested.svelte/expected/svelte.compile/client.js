import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';
import { slide } from 'svelte/transition';

var root = $.from_html(`<div style="height: 100px">leaf</div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function Nested_1($$anchor, $$props) {
	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => $$props.depth - 1);

				Nested($$anchor, {
					get depth() {
						return $.get($0);
					}
				});
			}
		};

		var alternate = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.depth > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `level-${$$props.depth ?? ''}`));
	$.transition(5, div, () => slide, () => ({ duration: 100 }));
	$.append($$anchor, div);
}