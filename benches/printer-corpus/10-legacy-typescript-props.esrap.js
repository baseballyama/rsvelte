import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';
import { onMount, createEventDispatcher } from 'svelte';
import { writable, derived } from 'svelte/store';

var root = $.from_html(`<p class="empty svelte-1jser4n"> </p>`);
var root_1 = $.from_html(`<button type="button">Dismiss</button>`);
var root_2 = $.from_html(`<li><span class="message"> </span> <span class="age"> </span> <!></li>`);
var root_3 = $.from_html(`<ul></ul>`);
var root_4 = $.from_html(`<button class="more" type="button"> </button>`);
var root_5 = $.from_html(`<div><header class="svelte-1jser4n"><h2> </h2> <span class="badge"> </span></header> <!> <!></div>`);

export default function Component($$anchor, $$props) {
	$.push($$props, false);

	const $now = () => $.store_get(now, '$now', $$stores);
	const $label = () => $.store_get(label, '$label', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const filtered = $.mutable_source();
	const visible = $.mutable_source();
	const hiddenCount = $.mutable_source();
	const errorCount = $.mutable_source();
	const heading = $.mutable_source();
	const ages = $.mutable_source();
	let title = $.prop($$props, 'title', 8, 'Notifications');
	let notices = $.prop($$props, 'notices', 28, () => []);
	let maxVisible = $.prop($$props, 'maxVisible', 8, 5);
	let dismissable = $.prop($$props, 'dismissable', 8, true);
	let emptyLabel = $.prop($$props, 'emptyLabel', 8, 'Nothing to show');
	let severityFilter = $.prop($$props, 'severityFilter', 8, null);
	const dispatch = createEventDispatcher();
	const now = writable(Date.now());
	const unreadCount = writable(0);
	const label = derived(unreadCount, (n) => n === 0 ? 'read' : `${n} unread`);
	let expanded = $.mutable_source(false);
	let hovered = $.mutable_source(null);
	let container = $.mutable_source();

	function dismiss(id) {
		notices(notices().filter((n) => n.id !== id));
		unreadCount.update((n) => Math.max(0, n - 1));
		dispatch('dismiss', { id });
	}

	function severityClass(severity) {
		return `notice notice--${severity}`;
	}

	onMount(() => {
		const timer = setInterval(() => now.set(Date.now()), 1000);

		dispatch('seen');

		return () => clearInterval(timer);
	});

	$.legacy_pre_effect(
		() => (
			$.deep_read_state(severityFilter()),
			$.deep_read_state(notices())
		),
		() => {
			$.set(filtered, severityFilter()
				? notices().filter((n) => n.severity === severityFilter())
				: notices());
		}
	);

	$.legacy_pre_effect(() => $.get(filtered), () => {
		$.set(errorCount, $.get(filtered).filter((n) => n.severity === 'error').length);
	});

	$.legacy_pre_effect(() => ($.get(errorCount), $.get(expanded)), () => {
		if ($.get(errorCount) > 0 && !$.get(expanded)) {
			$.set(expanded, true);
		}
	});

	$.legacy_pre_effect(
		() => (
			$.get(expanded),
			$.get(filtered),
			$.deep_read_state(maxVisible())
		),
		() => {
			$.set(visible, $.get(expanded)
				? $.get(filtered)
				: $.get(filtered).slice(0, maxVisible()));
		}
	);

	$.legacy_pre_effect(() => ($.get(filtered), $.get(visible)), () => {
		$.set(hiddenCount, $.get(filtered).length - $.get(visible).length);
	});

	$.legacy_pre_effect(() => ($.get(errorCount), $.deep_read_state(title())), () => {
		$.set(heading, $.get(errorCount) > 0 ? `${title()} (${$.get(errorCount)})` : title());
	});

	$.legacy_pre_effect(() => ($.get(visible), $now()), () => {
		$.set(ages, $.get(visible).map((n) => Math.max(0, Math.round(($now() - n.at) / 1000))));
	});

	$.legacy_pre_effect_reset();
	$.init();

	var div = root_5();
	let classes;
	var header = $.child(div);
	var h2 = $.child(header);
	var text = $.child(h2, true);

	$.reset(h2);

	var span = $.sibling(h2, 2);
	var text_1 = $.child(span, true);

	$.reset(span);
	$.reset(header);

	var node = $.sibling(header, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_2 = $.child(p, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text_2, emptyLabel()));
			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var ul = root_3();

			$.each(ul, 7, () => $.get(visible), (notice) => notice.id, ($$anchor, notice, i) => {
				var li = root_2();
				var span_1 = $.child(li);
				var text_3 = $.child(span_1, true);

				$.reset(span_1);

				var span_2 = $.sibling(span_1, 2);
				var text_4 = $.child(span_2);

				$.reset(span_2);

				var node_1 = $.sibling(span_2, 2);

				{
					var consequent_1 = ($$anchor) => {
						var button = root_1();

						$.event('click', button, () => dismiss($.get(notice).id));
						$.append($$anchor, button);
					};

					$.if(node_1, ($$render) => {
						if ((
							$.deep_read_state(dismissable()),
							$.get(hovered),
							$.get(notice),
							$.untrack(() => dismissable() && $.get(hovered) === $.get(notice).id)
						)) $$render(consequent_1);
					});
				}

				$.reset(li);

				$.template_effect(
					($0) => {
						$.set_class(li, 1, $0, 'svelte-1jser4n');
						$.set_text(text_3, ($.get(notice), $.untrack(() => $.get(notice).message)));

						$.set_text(text_4, `${(
							$.get(ages),
							$.deep_read_state($.get(i)),
							$.untrack(() => $.get(ages)[$.get(i)])
						) ?? ''}s`);
					},
					[
						() => $.clsx((
							$.get(notice),
							$.untrack(() => severityClass($.get(notice).severity))
						))
					]
				);

				$.event('mouseenter', li, () => $.set(hovered, $.get(notice).id));
				$.event('mouseleave', li, () => $.set(hovered, null));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.append($$anchor, ul);
		};

		$.if(node, ($$render) => {
			if (($.get(visible), $.untrack(() => $.get(visible).length === 0))) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var button_1 = root_4();
			var text_5 = $.child(button_1, true);

			$.reset(button_1);
			$.template_effect(() => $.set_text(text_5, $.get(expanded) ? 'Show less' : `Show ${$.get(hiddenCount)} more`));
			$.event('click', button_1, () => $.set(expanded, !$.get(expanded)));
			$.append($$anchor, button_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(hiddenCount) > 0) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(container, $$value), () => $.get(container));

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'panel svelte-1jser4n', null, classes, { 'panel--expanded': $.get(expanded) });
		$.set_text(text, $.get(heading));
		$.set_text(text_1, $label());
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
