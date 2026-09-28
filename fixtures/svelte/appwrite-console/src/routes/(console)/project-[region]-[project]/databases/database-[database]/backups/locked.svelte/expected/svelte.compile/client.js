import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { app } from '$lib/stores/app';
import UpgradeCard from './upgradeCard.svelte';
import ContainerHeader from './containerHeader.svelte';
import LockedBackupsDarkDesktop from '$lib/images/backups/empty/backups-dark.png';
import LockedBackupsLightDesktop from '$lib/images/backups/empty/backups-light.png';
import LockedBackupsDarkMobile from '$lib/images/backups/empty/backups-mobile-dark.png';
import LockedBackupsLightMobile from '$lib/images/backups/empty/backups-mobile-light.png';
import LockedBackupsDarkTablet from '$lib/images/backups/empty/backups-tablet-dark.png';
import LockedBackupsLightTablet from '$lib/images/backups/empty/backups-tablet-light.png';

var root = $.from_html(`<div class="u-flex-vertical u-gap-32"><!> <div><div class="is-only-mobile u-flex-vertical u-gap-16 svelte-aak3ad"><!> <img alt="create" aria-hidden="true" height="425"/></div> <div class="is-tablet u-flex-vertical u-gap-16 u-width-full-line svelte-aak3ad"><!> <img alt="create" height="425" aria-hidden="true"/></div> <div class="is-desktop u-flex-vertical u-gap-16 svelte-aak3ad"><div class="desktop-locked-card-buttons u-flex u-gap-24"><div style="width: 31%"><!></div> <div style="width: 69%; padding-inline-start: 1.5rem;"><!></div></div> <img alt="create" aria-hidden="true" height="580"/></div></div></div>`);

export default function Locked($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var div = root();
	var node = $.child(div);

	UpgradeCard(node, {
		get project() {
			return $$props.project;
		}
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	ContainerHeader(node_1, {
		get project() {
			return $$props.project;
		},
		title: 'Policies',
		buttonText: 'Create policy',
		buttonType: 'secondary',
		buttonDisabled: true
	});

	var img = $.sibling(node_1, 2);

	$.set_style(img, '', {}, { width: '100vw' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	ContainerHeader(node_2, {
		get project() {
			return $$props.project;
		},
		title: 'Policies',
		buttonText: 'Create policy',
		buttonType: 'secondary',
		buttonDisabled: true
	});

	var img_1 = $.sibling(node_2, 2);

	$.set_style(img_1, '', {}, { width: '100vw' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var node_3 = $.child(div_6);

	ContainerHeader(node_3, {
		get project() {
			return $$props.project;
		},
		title: 'Policies',
		buttonText: 'Create policy',
		buttonType: 'secondary',
		buttonDisabled: true
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_4 = $.child(div_7);

	ContainerHeader(node_4, {
		get project() {
			return $$props.project;
		},
		title: 'Backups',
		buttonText: 'Manual backup',
		buttonType: 'secondary',
		buttonDisabled: true
	});

	$.reset(div_7);
	$.reset(div_5);

	var img_2 = $.sibling(div_5, 2);

	$.set_style(img_2, '', {}, { width: '100vw' });
	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(img, 'src', $app().themeInUse === 'dark' ? LockedBackupsDarkMobile : LockedBackupsLightMobile);
		$.set_attribute(img_1, 'src', $app().themeInUse === 'dark' ? LockedBackupsDarkTablet : LockedBackupsLightTablet);
		$.set_attribute(img_2, 'src', $app().themeInUse === 'dark' ? LockedBackupsDarkDesktop : LockedBackupsLightDesktop);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}