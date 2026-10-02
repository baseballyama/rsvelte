import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from 'svelte-ux';
import LucideGithub from '~icons/lucide/github';
import LucideStar from '~icons/lucide/star';
import LucideSquareArrowOutUpRight from '~icons/lucide/square-arrow-out-up-right';

var root = $.from_html(`<p class="text-sm text-surface-content/50"> </p>`);
var root_1 = $.from_html(`<span class="flex items-center gap-1 text-sm text-surface-content/50 mr-auto"><!> </span>`);
var root_2 = $.from_html(`<div class="flex flex-col border border-primary/20 rounded-lg px-3 py-2 bg-linear-to-b from-primary/8 to-primary/2 backdrop-blur"><a target="_blank" class="text-lg font-medium"> </a> <!> <div class="grow flex items-end justify-end gap-1"><!> <!> <!></div></div>`);
var root_3 = $.from_html(`<div class="grid grid-cols-sm gap-3"></div>`);

export default function Showcase($$anchor, $$props) {
	var div = root_3();

	$.each(div, 21, () => $$props.sites, $.index, ($$anchor, site) => {
		var div_1 = root_2();
		var a = $.child(div_1);
		var text = $.only_child(a, true);
		var node = $.sibling(a, 2);

		{
			var consequent = ($$anchor) => {
				var p = root();
				var text_1 = $.only_child(p, true);

				$.template_effect(() => $.set_text(text_1, $.get(site).description));
				$.append($$anchor, p);
			};

			$.if(node, ($$render) => {
				if ($.get(site).description) $$render(consequent);
			});
		}

		var div_2 = $.sibling(node, 2);
		var node_1 = $.child(div_2);

		{
			var consequent_1 = ($$anchor) => {
				var span = root_1();
				var node_2 = $.child(span);

				LucideStar(node_2, { class: 'size-4' });

				var text_2 = $.sibling(node_2);

				$.reset(span);
				$.template_effect(($0) => $.set_text(text_2, ` ${$0 ?? ''}`), [() => $.get(site).stars.toLocaleString()]);
				$.append($$anchor, span);
			};

			$.if(node_1, ($$render) => {
				if ($.get(site).stars) $$render(consequent_1);
			});
		}

		var node_3 = $.sibling(node_1, 2);

		{
			var consequent_2 = ($$anchor) => {
				Button($$anchor, {
					get href() {
						return $.get(site).repourl;
					},
					target: '_blank',
					get icon() {
						return LucideGithub;
					},
					class: 'size-7 text-surface-content/50 hover:text-surface-content'
				});
			};

			$.if(node_3, ($$render) => {
				if ($.get(site).repourl) $$render(consequent_2);
			});
		}

		var node_4 = $.sibling(node_3, 2);

		{
			var consequent_3 = ($$anchor) => {
				Button($$anchor, {
					get href() {
						return $.get(site).homepageurl;
					},
					target: '_blank',
					get icon() {
						return LucideSquareArrowOutUpRight;
					},
					class: 'size-7 text-surface-content/50 hover:text-surface-content'
				});
			};

			$.if(node_4, ($$render) => {
				if ($.get(site).homepageurl) $$render(consequent_3);
			});
		}

		$.reset(div_2);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(site).repourl ?? $.get(site).homepageurl);
			$.set_text(text, $.get(site).name ?? $.get(site).reponame);
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
}