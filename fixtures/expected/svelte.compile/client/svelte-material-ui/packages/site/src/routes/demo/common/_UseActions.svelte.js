import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from './_UseActionsComponent.svelte';
import Pannable from './_UseActionsPannable';
import Swipeable from './_UseActionsSwipeable';
import Tappable from './_UseActionsTappable';

var root = $.from_html(`Swipe me.<br/> Tap me.<br/> Press me.`, 1);
var root_1 = $.from_html(`<div class="container svelte-15r9h79"><!></div>`);

export default function _UseActions($$anchor) {
	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(() => [
			Pannable,
			Swipeable,
			[
				Tappable,
				{
					bgColor: 'var(--mdc-theme-secondary)',
					color: 'var(--mdc-theme-on-secondary)'
				}
			]
		]);

		MyComponent(node, {
			get use() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment = root();

				$.next(4);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}