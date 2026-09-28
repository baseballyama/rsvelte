import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Image from "components/Image";
import Code from "docs/Code.svelte";
import images from "examples/images.txt";

var root = $.from_html(`<div class="my-8"><!></div>`);

var root_1 = $.from_html(
	`<p>Smelte includes convenience image component which is useful for lazyloading, but generally we recommend
  using <a class="a" href="https://github.com/matyunya/svelte-image">Svelte Image</a>.</p> <!> <!>`,
	1
);

export default function Images($$anchor, $$props) {
	$.push($$props, true);

	const range = [...new Array(50)];
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	Code(node, {
		get code() {
			return images;
		}
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => range, $.index, ($$anchor, _, i) => {
		var div = root();
		var node_2 = $.child(div);

		Image(node_2, {
			src: `https://placeimg.com/${400 + i}/${300 + i}/animals`,
			alt: `Kitty ${i}`,
			height: 400 + 1,
			width: 300 + 1
		});

		$.reset(div);
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
}