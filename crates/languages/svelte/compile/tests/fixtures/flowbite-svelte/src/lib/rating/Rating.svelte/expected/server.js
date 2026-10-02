import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import Star from "./Star.svelte";
import { rating as ratingVariants } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Rating($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			text,
			class: className,
			classes,
			size = 24,
			total = 5,
			rating = 4,
			icon: Icon = Star,
			count = false,
			pClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Rating", untrack(() => ({ pClass })), { pClass: "p" });

		const styling = $.derived(() => classes ?? { p: pClass });
		const theme = $.derived(() => getTheme("rating"));

		const $$d = $.derived(ratingVariants),
			base = $.derived(() => $$d().base),
			p = $.derived(() => $$d().p);

		const ratingGroupId = crypto.randomUUID();
		let clampedRating = $.derived(() => Math.max(0, Math.min(rating, total)));
		let fullStars = $.derived(() => Math.floor(clampedRating()));
		let rateDifference = $.derived(() => clampedRating() - fullStars());
		let percentRating = $.derived(() => Math.round(rateDifference() * 100));
		let grayStars = $.derived(() => total - (fullStars() + Math.ceil(rateDifference())));

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}>`);

		if (count && children) {
			$$renderer.push('<!--[0-->');

			if (Icon) {
				$$renderer.push('<!--[-->');
				Icon($$renderer, { fillPercent: 100, size, iconIndex: 0, groupId: ratingGroupId });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <p${$.attr_class($.clsx(p()({ class: clsx(theme()?.p, styling().p) })))}>${$.escape(rating)}</p> `);
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(Array(fullStars()));

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let _ = each_array[i];

				if (Icon) {
					$$renderer.push('<!--[-->');

					Icon($$renderer, {
						size,
						fillPercent: 100,
						iconIndex: i,
						groupId: `rating-${ratingGroupId}-full`
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]--> `);

			if (percentRating()) {
				$$renderer.push('<!--[0-->');

				if (Icon) {
					$$renderer.push('<!--[-->');

					Icon($$renderer, {
						size,
						fillPercent: percentRating(),
						iconIndex: fullStars(),
						groupId: `rating-${ratingGroupId}-partial`
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array_1 = $.ensure_array_like(Array(grayStars()));

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let _ = each_array_1[i];

				if (Icon) {
					$$renderer.push('<!--[-->');

					Icon($$renderer, {
						size,
						fillPercent: 0,
						iconIndex: i,
						groupId: `rating-${ratingGroupId}-empty`
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]--> `);

			if (text) {
				$$renderer.push('<!--[0-->');
				text($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}