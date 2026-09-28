import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<div class="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-10"><div class="space-y-10"><div class="card preset-filled-primary-500 w-56 aspect-square p-4 flex justify-center items-center"><span class="h1 text-8xl text-current">Aa</span></div> <div><div class="space-y-5"><h1 class="h1">Heading 1</h1> <h2 class="h2">Heading 2</h2> <h3 class="h3">Heading 3</h3> <h4 class="h4">Heading 4</h4> <h5 class="h5">Heading 5</h5> <h6 class="h6">Heading 6</h6></div></div> <div class="space-y-8"><p>The quick brown fox jumps over the lazy dog.</p> <div><a class="anchor">An example link</a></div> <div>Insert the <code class="code">.example</code> class here.</div> <div>The quick brown <mark class="mark">fox</mark> jumps over the lazy <mark class="mark">dog</mark>.</div> <div>Press <kbd class="kbd">⌘</kbd> + <kbd class="kbd">C</kbd> to copy.</div></div></div> <div class="space-y-10"><div class="space-y-4"><header class="flex justify-between items-center gap-4"><h1 class="h1">Lorem Ipsum</h1> <a href="https://skeleton.dev/docs/svelte/design/typography" target="_blank" class="btn btn-xs preset-tonal">View Docs</a></header> <p class="text-xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
				Tincidunt dui ut ornare lectus sit <a class="anchor">amet est placerat</a>. Nulla aliquet porttitor lacus luctus
				accumsan tortor posuere. Tempor orci eu lobortis elementum nibh tellus molestie nunc non. Vitae suscipit tellus mauris a diam
				maecenas sed enim ut. Blandit aliquam etiam erat velit scelerisque in dictum. Rhoncus aenean vel elit scelerisque mauris
				pellentesque pulvinar pellentesque habitant.</p> <h2 class="h2">Elementum Pulvinar</h2> <p>Id diam vel quam elementum pulvinar etiam non quam lacus. Vel pretium lectus quam id leo in vitae turpis. Aliquet sagittis id
				consectetur purus ut faucibus pulvinar. Dui id ornare arcu odio ut sem <a class="anchor">nulla pharetra</a> diam.
				Nec ultrices dui sapien eget mi. Interdum varius sit amet mattis vulputate. Sed risus pretium quam vulputate dignissim suspendisse in
				est. Sed nisi lacus sed viverra tellus in hac.</p> <h3 class="h3">Consectetur Libero</h3> <p>Elementum eu facilisis sed odio morbi. Adipiscing at in tellus integer. In est ante in nibh mauris. Leo duis ut diam quam nulla
				porttitor massa id. Urna neque viverra justo nec ultrices dui sapien eget mi. Nec feugiat nisl <a class="anchor">pretium fusce</a> id velit ut.</p></div> <blockquote class="blockquote"><p>"The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters
				of the heart, you'll know when you find it. And, like any great relationship, it just gets better and better as the years roll on."</p> <cite class="cite">&mdash; Steve Jobs</cite></blockquote> <div><del class="del"><s>Always</s> Gonna Give You Up</del> <ins class="ins" cite="https://youtu.be/dQw4w9WgXcQ" datetime="10-31-2022">Never Gonna Give You Up</ins></div> <pre class="pre">The quick brown fox jumps over the lazy dog.</pre></div></div>`);

export default function PreviewTypography($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 4);
	var div_3 = $.sibling($.child(div_2), 2);
	var a = $.only_child(div_3);

	$.next(6);
	$.reset(div_2);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var div_5 = $.child(div_4);
	var p = $.sibling($.child(div_5), 2);
	var a_1 = $.sibling($.child(p));

	$.next();
	$.reset(p);

	var p_1 = $.sibling(p, 4);
	var a_2 = $.sibling($.child(p_1));

	$.next();
	$.reset(p_1);

	var p_2 = $.sibling(p_1, 4);
	var a_3 = $.sibling($.child(p_2));

	$.next();
	$.reset(p_2);
	$.reset(div_5);
	$.next(6);
	$.reset(div_4);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a_1, 'href', $1);
			$.set_attribute(a_2, 'href', $2);
			$.set_attribute(a_3, 'href', $3);
		},
		[
			() => resolve('/'),
			() => resolve('/'),
			() => resolve('/'),
			() => resolve('/')
		]
	);

	$.append($$anchor, div);
	$.pop();
}