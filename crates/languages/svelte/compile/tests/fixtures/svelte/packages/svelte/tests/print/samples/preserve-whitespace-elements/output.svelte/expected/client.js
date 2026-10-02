import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<pre>

    hel

    lo
      .
</pre> <pre>  before
<span>  nested
 text  </span>
<!></pre> <textarea>  first
    second  </textarea>`,
	1
);

export default function Output($$anchor) {
	var fragment = root();

	$.head('1ny1jwk', ($$anchor) => {
		$.effect(() => {
			$.document.title = '  hello\n  world  ';
		});
	});

	var pre = $.sibling($.first_child(fragment), 2);
	var node = $.sibling($.child(pre), 3);

	{
		var consequent = ($$anchor) => {
			var text = $.text('  conditional\n value');

			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.reset(pre);
	$.next(2);
	$.append($$anchor, fragment);
}