import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import StarHalfIcon from '@lucide/svelte/icons/star-half';
import StarIcon from '@lucide/svelte/icons/star';
import { RatingGroup } from 'bits-ui';

var root = $.from_html(`<div class="relative size-full"><!> <!> <!></div>`);

export default function Star_rating_star($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('ring-ring text-primary ring-offset-background group/item size-5 rounded-md ring-offset-2 outline-hidden group-aria-disabled:opacity-50 focus-visible:ring-2', $$props.class));

		$.component(node, () => RatingGroup.Item, ($$anchor, RatingGroup_Item) => {
			RatingGroup_Item($$anchor, {
				get index() {
					return $$props.index;
				},

				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node_1 = $.child(div);

					{
						let $0 = $.derived(() => cn('size-full fill-transparent transition-all', { 'fill-current': $$props.state === 'active' }));

						StarIcon(node_1, {
							get class() {
								return $.get($0);
							}
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => cn('absolute top-0 left-0 size-full fill-transparent transition-all group-data-[state=active]/item:fill-current', { 'ltr:fill-current': $$props.state === 'partial' }));

						StarHalfIcon(node_2, {
							get class() {
								return $.get($0);
							}
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => cn('absolute top-0 right-0 size-full scale-x-[-1] fill-transparent transition-all group-data-[state=active]/item:fill-current', { 'rtl:fill-current': $$props.state === 'partial' }));

						StarHalfIcon(node_3, {
							get class() {
								return $.get($0);
							}
						});
					}

					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}