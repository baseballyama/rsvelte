import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { version } from '$app/environment';
import { Plus } from '@lucide/svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<img class="svelte-zqg6jl"/>`);
var root_1 = $.from_html(`<p class="lime-footer-wordmark svelte-zqg6jl"> </p>`);
var root_2 = $.from_html(`<a class="svelte-zqg6jl"> </a>`);
var root_3 = $.from_html(`<div class="lime-assistance svelte-zqg6jl"><span class="svelte-zqg6jl"> </span> <!></div>`);
var root_4 = $.from_html(`<p class="svelte-zqg6jl"> </p>`);
var root_5 = $.from_html(`<details class="lime-footer-col svelte-zqg6jl"><summary class="svelte-zqg6jl"><h3 class="svelte-zqg6jl"> </h3><!></summary> <!> <!></details>`);
var root_6 = $.from_html(`<p class="lime-copyright svelte-zqg6jl"> </p>`);
var root_7 = $.from_html(`<footer class="lime-footer svelte-zqg6jl"><!> <!> <div class="lime-footer-grid svelte-zqg6jl"></div> <!> <p class="lime-version svelte-zqg6jl"> </p></footer>`);

export default function LimeFooter($$anchor, $$props) {
	$.push($$props, true);

	let brandName = $.prop($$props, 'brandName', 3, '');

	// Footer columns are open on desktop, tap-to-expand accordions on mobile.
	// onMount (client-only, always in a valid context) sets up the media query;
	// using $effect here can throw effect_orphan depending on how the footer is
	// instantiated, and this listener doesn't depend on reactive state anyway.
	let footerColsOpen = $.state(true);

	onMount(() => {
		const mq = window.matchMedia('(min-width: 901px)');
		const sync = () => $.set(footerColsOpen, mq.matches, true);

		sync();
		mq.addEventListener('change', sync);

		return () => mq.removeEventListener('change', sync);
	});

	var footer_1 = root_7();
	var node = $.child(footer_1);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => {
				$.set_attribute(img, 'src', $$props.footer.logo);
				$.set_attribute(img, 'alt', $$props.footer.logoAlt || brandName());
			});

			$.append($$anchor, img);
		};

		var consequent_1 = ($$anchor) => {
			var p = root_1();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, brandName()));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.footer?.logo) $$render(consequent); else if (brandName()) $$render(consequent_1, 1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_3();
			var span = $.child(div);
			var text_2 = $.only_child(span, true);
			var node_2 = $.sibling(span, 2);

			$.each(node_2, 17, () => $$props.footer.assistance.links, $.index, ($$anchor, link) => {
				var a = root_2();
				var text_3 = $.only_child(a, true);

				$.template_effect(() => {
					$.set_attribute(a, 'href', $.get(link).href);
					$.set_text(text_3, $.get(link).label);
				});

				$.append($$anchor, a);
			});

			$.reset(div);
			$.template_effect(() => $.set_text(text_2, $$props.footer.assistance.label));
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($$props.footer?.assistance) $$render(consequent_2);
		});
	}

	var div_1 = $.sibling(node_1, 2);

	$.each(div_1, 21, () => $$props.footer?.columns || [], $.index, ($$anchor, column) => {
		var details = root_5();
		var summary = $.child(details);
		var h3 = $.child(summary);
		var text_4 = $.only_child(h3, true);
		var node_3 = $.sibling(h3);

		Plus(node_3, { class: 'lime-foot-plus' });
		$.reset(summary);

		var node_4 = $.sibling(summary, 2);

		$.each(node_4, 17, () => $.get(column).links || [], $.index, ($$anchor, link) => {
			var a_1 = root_2();
			var text_5 = $.only_child(a_1, true);

			$.template_effect(() => {
				$.set_attribute(a_1, 'href', $.get(link).href);
				$.set_text(text_5, $.get(link).label);
			});

			$.append($$anchor, a_1);
		});

		var node_5 = $.sibling(node_4, 2);

		$.each(node_5, 17, () => $.get(column).text || [], $.index, ($$anchor, text) => {
			var p_1 = root_4();
			var text_6 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_6, $.get(text)));
			$.append($$anchor, p_1);
		});

		$.reset(details);

		$.template_effect(() => {
			details.open = $.get(footerColsOpen);
			$.set_text(text_4, $.get(column).title);
		});

		$.append($$anchor, details);
	});

	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var p_2 = root_6();
			var text_7 = $.only_child(p_2, true);

			$.template_effect(() => $.set_text(text_7, $$props.footer.copyright));
			$.append($$anchor, p_2);
		};

		$.if(node_6, ($$render) => {
			if ($$props.footer?.copyright) $$render(consequent_3);
		});
	}

	var p_3 = $.sibling(node_6, 2);
	var text_8 = $.only_child(p_3);

	$.reset(footer_1);
	$.template_effect(() => $.set_text(text_8, `v${version ?? ''}`));
	$.append($$anchor, footer_1);
	$.pop();
}