import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import IconifyIcon from '../IconifyIcon.svelte';
import External from '../icons/External.svelte';

var root = $.from_html(`<div class="icon svelte-1g2swee"><!></div>`);
var root_1 = $.from_html(`<div role="link" tabindex="0"><div class="flex justify-between items-start"><!> <!></div> <div class="feature-title svelte-1g2swee"> </div> <div class="feature-desc svelte-1g2swee"> </div></div>`);

export default function Feature($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {object} Props
	 * @property {any} i Index of the feature card
	 * @property {any} title Title of the feature card
	 * @property {any} description Description of the feature card
	 * @property {any} [link] Link to navigate to when the card is clicked
	 * @property {(e: any) => any} onkeypress Function to call when the card is pressed
	 * @property {import('./types').CustomIcon} [icon] Custom icon to display in the card
	 */
	/** @type {Props} */
	const onkeypress = $.prop($$props, 'onkeypress', 3, undefined),
		link = $.prop($$props, 'link', 3, undefined),
		icon = $.prop($$props, 'icon', 3, undefined);

	const external = $.derived(() => (/^https?/).test(link()));

	function handleFeatureCardClick() {
		if (!link()) return;
		if ($.get(external)) window.open(link(), '_blank'); else goto(link());
	}

	var div = root_1();
	let classes;
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root();
			var node_1 = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					var fragment = $.comment();
					var node_2 = $.first_child(fragment);

					$.html(node_2, () => icon().value);
					$.append($$anchor, fragment);
				};

				var consequent_1 = ($$anchor) => {
					IconifyIcon($$anchor, $.spread_props(icon));
				};

				$.if(node_1, ($$render) => {
					if (icon().type === 'svg') $$render(consequent); else if (icon().type === 'iconify') $$render(consequent_1, 1);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (icon()?.type) $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			External($$anchor, {});
		};

		$.if(node_3, ($$render) => {
			if ($.get(external)) $$render(consequent_3);
		});
	}

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var text = $.only_child(div_3, true);
	var div_4 = $.sibling(div_3, 2);
	var text_1 = $.only_child(div_4, true);

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'feature-item svelte-1g2swee', null, classes, { clickable: link() });
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.description);
	});

	$.delegated('click', div, handleFeatureCardClick);

	$.event('keypress', div, function (...$$args) {
		onkeypress()?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);