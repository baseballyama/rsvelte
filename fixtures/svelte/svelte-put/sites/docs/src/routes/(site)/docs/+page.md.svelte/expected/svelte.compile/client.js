import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { StatusBadge } from '$lib/components/status-badge';
import { createNpmBadgeUrl, createNpmUrl } from '$lib/utils/badge';

var root = $.from_html(`<tr class="*:border *:p-4"><td><a class="c-link font-medium"> </a></td><td> </td><td class="w-40"><a target="_blank" class="block" data-external=""><img class="block rounded" width="180" height="22" loading="lazy" decoding="async"/></a></td><td><!></td></tr>`);

var root_1 = $.from_html(
	`# @svelte-put <p class="c-callout c-callout--info c-callout--icon-bulb">svelte-put is a collection of useful svelte actions, utilities, and minimal components extracted
	from (my) real world projects that might be helpful for yours.</p> ## Packages

\`@svelte-put\` includes several packages with self-manged release cycles, listed below. Check out their corresponding documentation for more details. <table class="not-prose border-collapse w-full"><thead><tr class="*:text-left *:p-4 *:border *:bg-bg-100"><th>ID</th><th>Desrciption</th><th>Version</th><th>Status</th></tr></thead><tbody class="*:even:bg-bg-100/50"></tbody></table> ## Inspiration & Acknowledgement

There is already a great pool of [svelte actions collected by Shawn
and other contributors](https://github.com/sw-yx/svelte-actions) that you should check out. There
might be some duplications here and there. However:

- Shawn's project aims to be a source for RFCs into Svelte; I believe stuff I am putting here should stay in user land.
- I prefer having separate packages for their dedicated purposes (instead of one package that exports everything).
- I want to incrementally include more than just actions int his collection.

For those reasons, a monorepo seems
like a good fit, hence this project. To contribute or support the project, head over to the
[contributing page](/docs/contributing). Happy coding! 👨‍💻 <p class="text-right text-sm"><a class="c-link" href="https://github.com/vnphanquang/svelte-put/edit/main/sites/docs/src/routes/(site)/docs/+page.md.svelte">Edit this page on Github</a></p>`,
	1
);

export default function _page_md($$anchor, $$props) {
	$.push($$props, true);
	$.next();

	var fragment = root_1();
	var table = $.sibling($.first_child(fragment), 3);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => $$props.data.packages.active, $.index, ($$anchor, $$item) => {
		let id = () => $.get($$item).id;
		let description = () => $.get($$item).description;
		let status = () => $.get($$item).status;
		let releaseTag = () => $.get($$item).releaseTag;
		const name = $.derived(() => `@svelte-put/${id()}`);
		var tr = root();
		var td = $.child(tr);
		var a = $.child(td);
		var text = $.only_child(a, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_1 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var a_1 = $.child(td_2);
		var img = $.only_child(a_1);

		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var node = $.child(td_3);

		StatusBadge(node, {
			get status() {
				return status();
			}
		});

		$.reset(td_3);
		$.reset(tr);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(a, 'href', `/docs/${id() ?? ''}`);
				$.set_text(text, id());
				$.set_text(text_1, description());
				$.set_attribute(a_1, 'href', $0);
				$.set_attribute(img, 'src', $1);
				$.set_attribute(img, 'alt', $.get(name));
			},
			[
				() => createNpmUrl($.get(name)),
				() => createNpmBadgeUrl($.get(name), releaseTag())
			]
		);

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}