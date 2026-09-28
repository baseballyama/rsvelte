import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ProfileCard from '$lib/components/library/Components/ProfileCard/ProfileCard.svelte';
import source from '$lib/components/library/Components/ProfileCard/ProfileCard.svelte?raw';

export default function ProfileCardDemo($$renderer) {
	const DEFAULTS = {
		showIcon: true,
		showUserInfo: false,
		enableMobileTilt: false,
		showBehindGlow: true
	};

	let showIcon = DEFAULTS.showIcon;
	let showUserInfo = DEFAULTS.showUserInfo;
	let enableMobileTilt = DEFAULTS.enableMobileTilt;
	let showBehindGlow = DEFAULTS.showBehindGlow;
	let key = 0;
	const hasChanges = $.derived(() => showIcon !== DEFAULTS.showIcon || showUserInfo !== DEFAULTS.showUserInfo || enableMobileTilt !== DEFAULTS.enableMobileTilt || showBehindGlow !== DEFAULTS.showBehindGlow);

	function reset() {
		showIcon = DEFAULTS.showIcon;
		showUserInfo = DEFAULTS.showUserInfo;
		enableMobileTilt = DEFAULTS.enableMobileTilt;
		showBehindGlow = DEFAULTS.showBehindGlow;
		key++;
	}

	function bump() {
		key++;
	}

	const usage = `<ProfileCard name="Jane" title="Engineer" handle="jane" avatarUrl="/avatar.png" />`;

	const props = [
		{
			name: 'avatarUrl',
			type: 'string',
			default: '""',
			description: 'Main avatar image URL.'
		},

		{
			name: 'iconUrl',
			type: 'string',
			default: '""',
			description: 'Icon pattern overlay URL.'
		},

		{
			name: 'grainUrl',
			type: 'string',
			default: '""',
			description: 'Grain texture URL.'
		},

		{
			name: 'innerGradient',
			type: 'string',
			default: 'preset',
			description: 'Custom inner gradient CSS.'
		},

		{
			name: 'behindGlowEnabled',
			type: 'boolean',
			default: 'true',
			description: 'Pointer-following glow.'
		},

		{
			name: 'behindGlowColor',
			type: 'string',
			default: 'rgba blue',
			description: 'Glow color.'
		},

		{
			name: 'behindGlowSize',
			type: 'string',
			default: '"50%"',
			description: 'Glow size.'
		},

		{
			name: 'enableTilt',
			type: 'boolean',
			default: 'true',
			description: '3D tilt on hover.'
		},

		{
			name: 'enableMobileTilt',
			type: 'boolean',
			default: 'false',
			description: 'Device-orientation tilt.'
		},

		{
			name: 'mobileTiltSensitivity',
			type: 'number',
			default: '5',
			description: 'Mobile tilt sensitivity.'
		},

		{
			name: 'miniAvatarUrl',
			type: 'string',
			default: '-',
			description: 'Mini avatar URL.'
		},

		{
			name: 'name',
			type: 'string',
			default: '"Javi A. Torres"',
			description: 'Display name.'
		},

		{
			name: 'title',
			type: 'string',
			default: '"Software Engineer"',
			description: 'Role.'
		},

		{
			name: 'handle',
			type: 'string',
			default: '"javicodes"',
			description: 'Handle (without @).'
		},

		{
			name: 'status',
			type: 'string',
			default: '"Online"',
			description: 'Status text.'
		},

		{
			name: 'contactText',
			type: 'string',
			default: '"Contact"',
			description: 'Button label.'
		},

		{
			name: 'showUserInfo',
			type: 'boolean',
			default: 'true',
			description: 'Show user info bar.'
		},

		{
			name: 'onContactClick',
			type: '() => void',
			default: '-',
			description: 'Contact button callback.'
		}
	];

	$.head('1vdaclh', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Profile Card - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Profile Card</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:700px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><!---->`);

			{
				ProfileCard($$renderer, {
					name: 'Javi A. Torres',
					title: 'Software Engineer',
					handle: 'javicodes',
					status: 'Online',
					contactText: 'Contact Me',
					avatarUrl: '/assets/demo/person.webp',
					iconUrl: showIcon ? '/assets/demo/iconpattern.png' : '',
					grainUrl: '/assets/demo/grain.webp',
					showUserInfo,
					behindGlowEnabled: showBehindGlow,
					enableMobileTilt
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'profile-card', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSwitch($$renderer, {
						title: 'Behind Glow',
						checked: showBehindGlow,
						onChange: (v) => {
							showBehindGlow = v;
							bump();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Show Icon Pattern',
						checked: showIcon,
						onChange: (v) => {
							showIcon = v;
							bump();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Show User Info',
						checked: showUserInfo,
						onChange: (v) => {
							showUserInfo = v;
							bump();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Enable Mobile Tilt',
						checked: enableMobileTilt,
						onChange: (v) => {
							enableMobileTilt = v;
							bump();
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		function propTable($$renderer) {
			PropTable($$renderer, { rows: props });
		}

		TabsLayout($$renderer, {
			onreset: reset,
			hasChanges: hasChanges(),
			componentName: 'ProfileCard',
			usage,
			source,
			props,
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$$renderer.push(`<!---->`);
}