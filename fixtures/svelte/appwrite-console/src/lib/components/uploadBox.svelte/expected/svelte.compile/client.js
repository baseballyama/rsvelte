import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { humanFileSize } from '$lib/helpers/sizeConvertion';
import { getUploadGroupKey, uploader } from '$lib/stores/uploader';
import { Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<li class="upload-box-item svelte-5ux59m"><span class="icon-document" aria-hidden="true"></span> <div class="file-name svelte-5ux59m"><!> <!></div> <span aria-hidden="true"><span></span></span></li>`);
var root_1 = $.from_html(`<section class="upload-box"><header class="upload-box-header"><h4 class="upload-box-title svelte-5ux59m"><!></h4> <button><span class="icon-cheveron-up" aria-hidden="true"></span></button> <button class="upload-box-button svelte-5ux59m"><span class="icon-x" aria-hidden="true"></span></button></header> <div><ul class="upload-box-list"></ul></div></section>`);
var root_2 = $.from_html(`<div class="box-holder u-flex u-flex-vertical u-gap-16" style="align-items: end"></div>`);

export default function UploadBox($$anchor, $$props) {
	$.push($$props, true);

	const $uploader = () => $.store_get(uploader, '$uploader', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const groupTitles = { storage: 'File Uploads', deployments: 'Deployment Uploads' };

	const groups = $.derived(() => {
		return Object.keys(groupTitles).map((groupKey) => {
			const files = $uploader().files.filter((file) => getUploadGroupKey(file.kind) === groupKey);

			return {
				key: groupKey,
				title: groupTitles[groupKey],
				files,
				isOpen: $uploader().groups[groupKey].isOpen
			};
		}).filter((group) => group.files.length && $uploader().groups[group.key].isVisible);
	});

	function statusIcon(status) {
		if (status === 'success') return 'icon-check';
		if (status === 'failed') return 'icon-warning';

		return 'icon-clock';
	}

	function statusClass(status) {
		if (status === 'success') return 'is-success';
		if (status === 'failed') return 'is-danger';

		return '';
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_2();

			$.each(div, 21, () => $.get(groups), (group) => group.key, ($$anchor, group) => {
				var section = root_1();
				var header = $.child(section);
				var h4 = $.child(header);
				var node_1 = $.child(h4);

				$.component(node_1, () => Typography.Text, ($$anchor, Typography_Text) => {
					Typography_Text($$anchor, {
						variant: 'm-500',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${$.get(group).title ?? ''} (${$.get(group).files.length ?? ''})`));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.reset(h4);

				var button = $.sibling(h4, 2);
				let classes;
				var button_1 = $.sibling(button, 2);

				$.reset(header);

				var div_1 = $.sibling(header, 2);
				let classes_1;
				var ul = $.child(div_1);

				$.each(ul, 21, () => $.get(group).files, (file) => file.clientId, ($$anchor, file) => {
					const readableSize = $.derived(() => humanFileSize($.get(file).size));
					var li = root();
					var div_2 = $.sibling($.child(li), 2);
					var node_2 = $.child(div_2);

					$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text_1) => {
						Typography_Text_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, $.get(file).name));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Typography.Caption, ($$anchor, Typography_Caption) => {
						Typography_Caption($$anchor, {
							variant: '400',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, $.get(readableSize).value + $.get(readableSize).unit));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_2);

					var span = $.sibling(div_2, 2);
					var span_1 = $.only_child(span);

					$.reset(li);

					$.template_effect(
						($0, $1) => {
							$.set_class(span, 1, $0, 'svelte-5ux59m');
							$.set_class(span_1, 1, $1, 'svelte-5ux59m');
						},
						[
							() => `upload-box-button ${statusClass($.get(file).status)}`,
							() => $.clsx(statusIcon($.get(file).status))
						]
					);

					$.append($$anchor, li);
				});

				$.reset(ul);
				$.reset(div_1);
				$.reset(section);

				$.template_effect(
					($0, $1) => {
						classes = $.set_class(button, 1, 'upload-box-button svelte-5ux59m', null, classes, { 'is-open': $.get(group).isOpen });
						$.set_attribute(button, 'aria-label', $0);
						$.set_attribute(button_1, 'aria-label', $1);
						classes_1 = $.set_class(div_1, 1, 'upload-box-content svelte-5ux59m', null, classes_1, { 'is-open': $.get(group).isOpen });
					},
					[
						() => `toggle ${$.get(group).title.toLowerCase()}`,
						() => `close ${$.get(group).title.toLowerCase()}`
					]
				);

				$.delegated('click', button, () => uploader.toggleGroup($.get(group).key));
				$.delegated('click', button_1, () => uploader.hideGroup($.get(group).key));
				$.append($$anchor, section);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($uploader().isOpen) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);