import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '@components/Inspect.svelte';
import { globalOpts } from '@components/global-opts/globalopts.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'seeFlashing']);
var root = $.from_html(`<label class="svelte-egb075">increment number <input type="checkbox"/></label>`);

export default function Generic($$anchor, $$props) {
	$.push($$props, true);

	let seeFlashing = $.prop($$props, 'seeFlashing', 15, false),
		props = $.rest_props($$props, rest_excludes);

	$.user_effect(() => {
		const interval = window.setInterval(
			() => {
				if (seeFlashing()) values.age++;
			},
			2000
		);

		return () => window.clearInterval(interval);
	});

	const allTypesSearch = $.derived(() => {
		if (globalOpts?.search === false) {
			return 'highlight';
		}

		return globalOpts?.search ?? undefined;
	});

	let values = $.proxy({
		id: undefined,
		firstName: 'Bob',
		lastName: 'Alice',
		email: 'bob@alice.lol',
		introduction: `The name is Alice.

    Bob Alice.`,
		birthDate: new Date(),
		website: new URL('https://alicebob.website/?ref=abcdefg#about'),
		age: -42,
		emailVerified: true,
		interests: ['radio', 'tv', 'internet', 'kayaks'],
		nilVals: [undefined, null, NaN, Infinity],
		get interestList() {
			return this.interests.join('\n');
		},

		doStuff() {
			if (this.emailVerified) {
				return this.email;
			} else {
				throw 'can not do stuff if email not verified';
			}
		}
	});

	{
		const heading = ($$anchor, collapsed = $.noop) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var label = root();
					var input = $.sibling($.child(label));

					$.remove_input_defaults(input);
					$.reset(label);

					$.delegated('click', label, (e) => {
						e.stopPropagation();
					});

					$.bind_checked(input, seeFlashing);
					$.append($$anchor, label);
				};

				$.if(node, ($$render) => {
					if (!collapsed()) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		Inspect($$anchor, $.spread_props({ class: 'not-content mt' }, () => props, {
			get values() {
				return values;
			},

			get search() {
				return $.get(allTypesSearch);
			},
			expandLevel: 0,
			heading,
			$$slots: { heading: true }
		}));
	}

	$.pop();
}

$.delegate(['click']);