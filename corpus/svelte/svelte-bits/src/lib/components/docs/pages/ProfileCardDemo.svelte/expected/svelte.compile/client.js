import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ProfileCard from '$lib/components/library/Components/ProfileCard/ProfileCard.svelte';
import source from '$lib/components/library/Components/ProfileCard/ProfileCard.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:700px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Profile Card</h1> <!>`, 1);

export default function ProfileCardDemo($$anchor) {
	const DEFAULTS = {
		showIcon: true,
		showUserInfo: false,
		enableMobileTilt: false,
		showBehindGlow: true
	};

	let showIcon = $.state($.proxy(DEFAULTS.showIcon));
	let showUserInfo = $.state($.proxy(DEFAULTS.showUserInfo));
	let enableMobileTilt = $.state($.proxy(DEFAULTS.enableMobileTilt));
	let showBehindGlow = $.state($.proxy(DEFAULTS.showBehindGlow));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(showIcon) !== DEFAULTS.showIcon || $.get(showUserInfo) !== DEFAULTS.showUserInfo || $.get(enableMobileTilt) !== DEFAULTS.enableMobileTilt || $.get(showBehindGlow) !== DEFAULTS.showBehindGlow);

	function reset() {
		$.set(showIcon, DEFAULTS.showIcon, true);
		$.set(showUserInfo, DEFAULTS.showUserInfo, true);
		$.set(enableMobileTilt, DEFAULTS.enableMobileTilt, true);
		$.set(showBehindGlow, DEFAULTS.showBehindGlow, true);
		$.update(key);
	}

	function bump() {
		$.update(key);
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

	var fragment = root_2();

	$.head('1vdaclh', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Profile Card - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				{
					let $0 = $.derived(() => $.get(showIcon) ? '/assets/demo/iconpattern.png' : '');

					ProfileCard($$anchor, {
						name: 'Javi A. Torres',
						title: 'Software Engineer',
						handle: 'javicodes',
						status: 'Online',
						contactText: 'Contact Me',
						avatarUrl: '/assets/demo/person.webp',
						get iconUrl() {
							return $.get($0);
						},
						grainUrl: '/assets/demo/grain.webp',
						get showUserInfo() {
							return $.get(showUserInfo);
						},

						get behindGlowEnabled() {
							return $.get(showBehindGlow);
						},

						get enableMobileTilt() {
							return $.get(enableMobileTilt);
						}
					});
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'profile-card',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewSwitch(node_2, {
						title: 'Behind Glow',
						get checked() {
							return $.get(showBehindGlow);
						},

						onChange: (v) => {
							$.set(showBehindGlow, v, true);
							bump();
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSwitch(node_3, {
						title: 'Show Icon Pattern',
						get checked() {
							return $.get(showIcon);
						},

						onChange: (v) => {
							$.set(showIcon, v, true);
							bump();
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Show User Info',
						get checked() {
							return $.get(showUserInfo);
						},

						onChange: (v) => {
							$.set(showUserInfo, v, true);
							bump();
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Enable Mobile Tilt',
						get checked() {
							return $.get(enableMobileTilt);
						},

						onChange: (v) => {
							$.set(enableMobileTilt, v, true);
							bump();
						}
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'ProfileCard',
			usage,
			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment);
}