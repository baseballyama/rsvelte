import * as $ from 'svelte/internal/server';
import { humanFileSize } from '$lib/helpers/sizeConvertion';
import { getUploadGroupKey, uploader } from '$lib/stores/uploader';
import { Typography } from '@appwrite.io/pink-svelte';

export default function UploadBox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const groupTitles = { storage: 'File Uploads', deployments: 'Deployment Uploads' };

		const groups = $.derived(() => {
			return Object.keys(groupTitles).map((groupKey) => {
				const files = $.store_get($$store_subs ??= {}, '$uploader', uploader).files.filter((file) => getUploadGroupKey(file.kind) === groupKey);

				return {
					key: groupKey,
					title: groupTitles[groupKey],
					files,
					isOpen: $.store_get($$store_subs ??= {}, '$uploader', uploader).groups[groupKey].isOpen
				};
			}).filter((group) => group.files.length && $.store_get($$store_subs ??= {}, '$uploader', uploader).groups[group.key].isVisible);
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

		if ($.store_get($$store_subs ??= {}, '$uploader', uploader).isOpen) {
			$$renderer.push(`<!--[0--><div class="box-holder u-flex u-flex-vertical u-gap-16" style="align-items: end"><!--[-->`);

			const each_array = $.ensure_array_like(groups());

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let group = each_array[$$index_1];

				$$renderer.push(`<section class="upload-box"><header class="upload-box-header"><h4 class="upload-box-title svelte-5ux59m">`);

				if (Typography.Text) {
					$$renderer.push('<!--[-->');

					Typography.Text($$renderer, {
						variant: 'm-500',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(group.title)} (${$.escape(group.files.length)})`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</h4> <button${$.attr_class('upload-box-button svelte-5ux59m', void 0, { 'is-open': group.isOpen })}${$.attr('aria-label', `toggle ${group.title.toLowerCase()}`)}><span class="icon-cheveron-up" aria-hidden="true"></span></button> <button class="upload-box-button svelte-5ux59m"${$.attr('aria-label', `close ${group.title.toLowerCase()}`)}><span class="icon-x" aria-hidden="true"></span></button></header> <div${$.attr_class('upload-box-content svelte-5ux59m', void 0, { 'is-open': group.isOpen })}><ul class="upload-box-list"><!--[-->`);

				const each_array_1 = $.ensure_array_like(group.files);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let file = each_array_1[$$index];
					const readableSize = humanFileSize(file.size);

					$$renderer.push(`<li class="upload-box-item svelte-5ux59m"><span class="icon-document" aria-hidden="true"></span> <div class="file-name svelte-5ux59m">`);

					if (Typography.Text) {
						$$renderer.push('<!--[-->');

						Typography.Text($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(file.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Typography.Caption) {
						$$renderer.push('<!--[-->');

						Typography.Caption($$renderer, {
							variant: '400',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(readableSize.value + readableSize.unit)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <span${$.attr_class(`upload-box-button ${statusClass(file.status)}`, 'svelte-5ux59m')} aria-hidden="true"><span${$.attr_class($.clsx(statusIcon(file.status)), 'svelte-5ux59m')}></span></span></li>`);
				}

				$$renderer.push(`<!--]--></ul></div></section>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}