import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { Modal, CustomId } from '$lib/components';
import { InputText, Button } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { ID } from '@appwrite.io/console';
import { IconPencil } from '@appwrite.io/pink-icons-svelte';
import { Icon, Tag } from '@appwrite.io/pink-svelte';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<!> Team ID`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function CreateTeam($$anchor, $$props) {
	$.push($$props, true);

	let showCreate = $.prop($$props, 'showCreate', 15, false);
	const dispatch = createEventDispatcher();
	let name = $.state('');
	let id = $.state(null);
	let error = $.state(null);
	let showCustomId = $.state(false);

	const create = async () => {
		try {
			const team = await sdk.forProject(page.params.region, page.params.project).teams.create({ teamId: $.get(id) ?? ID.unique(), name: $.get(name) });

			$.set(name, '');
			showCreate(false);
			$.set(showCustomId, false);
			addNotification({ type: 'success', message: `${team.name} has been created` });
			trackEvent(Submit.TeamCreate, { customId: !!$.get(id) });
			dispatch('created', team);
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.TeamCreate);
		}
	};

	$.user_effect(() => {
		if (!showCreate()) {
			$.set(showCustomId, false);
			$.set(id, null);
			$.set(error, null);
		}
	});

	Modal($$anchor, {
		title: 'Create team',
		get error() {
			return $.get(error);
		},
		size: 'm',
		onSubmit: create,
		get show() {
			return showCreate();
		},

		set show($$value) {
			showCreate($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			InputText(node, {
				id: 'name',
				label: 'Name',
				placeholder: 'Enter name',
				autofocus: true,
				required: true,
				get value() {
					return $.get(name);
				},

				set value($$value) {
					$.set(name, $$value, true);
				}
			});

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					var div = root_1();
					var node_2 = $.child(div);

					Tag(node_2, {
						size: 's',
						$$events: { click: () => $.set(showCustomId, !$.get(showCustomId)) },
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							Icon(node_3, {
								get icon() {
									return IconPencil;
								}
							});

							$.next();
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});

					$.reset(div);
					$.append($$anchor, div);
				};

				var alternate = ($$anchor) => {
					CustomId($$anchor, {
						autofocus: true,
						name: 'Team',
						get show() {
							return $.get(showCustomId);
						},

						set show($$value) {
							$.set(showCustomId, $$value, true);
						},

						get id() {
							return $.get(id);
						},

						set id($$value) {
							$.set(id, $$value, true);
						}
					});
				};

				$.if(node_1, ($$render) => {
					if (!$.get(showCustomId)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_4 = root_2();
				var node_4 = $.first_child(fragment_4);

				Button(node_4, {
					secondary: true,
					$$events: { click: () => showCreate(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				Button(node_5, {
					submit: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Create');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_4);
			}
		}
	});

	$.pop();
}