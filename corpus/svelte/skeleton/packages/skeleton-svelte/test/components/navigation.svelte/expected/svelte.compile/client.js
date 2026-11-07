import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Navigation } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Navigation_1($$anchor) {
	Navigation($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Navigation.Header, ($$anchor, Navigation_Header) => {
				Navigation_Header($$anchor, { 'data-testid': 'header' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Navigation.Content, ($$anchor, Navigation_Content) => {
				Navigation_Content($$anchor, { 'data-testid': 'content' });
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Navigation.Group, ($$anchor, Navigation_Group) => {
				Navigation_Group($$anchor, { 'data-testid': 'group' });
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => Navigation.Label, ($$anchor, Navigation_Label) => {
				Navigation_Label($$anchor, { 'data-testid': 'label' });
			});

			var node_4 = $.sibling(node_3, 2);

			$.component(node_4, () => Navigation.Menu, ($$anchor, Navigation_Menu) => {
				Navigation_Menu($$anchor, { 'data-testid': 'menu' });
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => Navigation.Footer, ($$anchor, Navigation_Footer) => {
				Navigation_Footer($$anchor, { 'data-testid': 'footer' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}