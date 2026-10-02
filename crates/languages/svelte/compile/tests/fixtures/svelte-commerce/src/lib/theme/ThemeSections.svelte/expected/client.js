import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SECTIONS } from './sections/index.js';

var root = $.from_html(`<div></div>`);

export default function ThemeSections($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * Renders a theme's homepage from its layout: an ordered list of section types with options,
	 * served by the API. The storefront supplies the section components and the live commerce
	 * data; the theme supplies the order, the settings and the stylesheet.
	 *
	 * An unknown section type is skipped rather than thrown, so a layout authored against a
	 * newer section library degrades to the sections this build knows instead of a blank page.
	 */
	const sections = $.derived(() => ($$props.layout?.sections ?? []).filter((section) => {
		const known = !!SECTIONS[section.type];

		if (!known && typeof console !== 'undefined') {
			console.warn(`[theme] unknown section type "${section.type}" — skipped`);
		}

		return known;
	}));

	var div = root();

	$.each(div, 21, () => $.get(sections), $.index, ($$anchor, section) => {
		const Section = $.derived(() => SECTIONS[$.get(section).type]);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			let $0 = $.derived(() => $.get(section).options ?? {});

			$.component(node, () => $.get(Section), ($$anchor, Section_1) => {
				Section_1($$anchor, {
					get ctx() {
						return $$props.ctx;
					},

					get options() {
						return $.get($0);
					}
				});
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `ts-home ${$$props.layout?.rootClass ?? '' ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}