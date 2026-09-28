import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>+1</button> <button>null</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let obj = $.state($.proxy({ count: 0 }));

	$.effect_root(() => {
		let teardown;

		$.user_pre_effect(() => {
			if ($.get(obj)) {
				teardown ??= $.effect_root(() => {
					$.user_pre_effect(() => {
						console.log($.get(obj).count);
					});
				});
			} else {
				teardown?.();
				teardown = null;
			}
		});
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => $.set(obj, $.get(obj) ?? { count: 0 }, true).count += 1);
	$.delegated('click', button_1, () => $.set(obj, null));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);