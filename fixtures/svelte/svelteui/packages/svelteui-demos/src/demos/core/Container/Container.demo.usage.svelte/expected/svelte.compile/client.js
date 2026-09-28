import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { theme, Container } from '@svelteuidev/core';

const code = `
    <script>
        import { Container } from '@svelteuidev/core'
    <\/script>

    <Container override={{bc: 'AliceBlue'}}>
        Default container
    </Container>

    <Container size="xs" override={{px: 'xs', bc: 'AliceBlue'}}>
        xs container with xs horizontal padding
    </Container>

    <Container size={200} override={{px: 0, bc: 'AliceBlue'}}>
        200px container with 0px horizontal padding
    </Container>
    
	`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Container_demo_usage($$anchor, $$props) {
	$.push($$props, true);

	const color = theme.colors['blue50'].value;
	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ backgroundColor: color, height: 50 }));

		Container(node, {
			get override() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Default container');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({ backgroundColor: color, height: 50, px: '$sm', mt: 20 }));

		Container(node_1, {
			size: 'xs',
			get override() {
				return $.get($0);
			},
			mt: 20,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('xs container with xs horizontal padding');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => ({ backgroundColor: color, height: 50, px: 0, mt: 20 }));

		Container(node_2, {
			size: 200,
			get override() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('200px container with 0px horizontal padding');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}