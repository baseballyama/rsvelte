import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { iconPath } from '$lib/stores/app';
import { sdk } from '$lib/stores/sdk';
import { installation, repository } from '$lib/stores/vcs';
import { VCSDetectionType } from '@appwrite.io/console';
import DirectoryPicker from '$lib/components/git/DirectoryPicker.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<span slot="description">Select the directory where your site code is located using the menu below.</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function SelectRootModal($$anchor, $$props) {
	$.push($$props, true);

	const $iconPath = () => $.store_get(iconPath, '$iconPath', $$stores);
	const $installation = () => $.store_get(installation, '$installation', $$stores);
	const $repository = () => $.store_get(repository, '$repository', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15, false),
		rootDir = $.prop($$props, 'rootDir', 15, ''),
		product = $.prop($$props, 'product', 3, 'functions');

	let isLoading = $.state(true);

	let directories = $.proxy([
		{
			title: 'Repository (root)',
			fullPath: '/',
			fileCount: undefined,
			thumbnailUrl: $iconPath()('empty', 'grayscale'),
			children: [],
			hasChildren: true,
			loading: false
		}
	]);

	let currentPath = $.state('/');
	let expandedPaths = $.state($.proxy([]));
	const expandedStore = writable([]);

	$.user_effect(() => {
		expandedStore.set($.get(expandedPaths));
	});

	$.user_effect(() => {
		const unsub = expandedStore.subscribe((v) => {
			$.set(expandedPaths, v, true);
		});

		return unsub;
	});

	let initialized = $.state(false);
	let initialPath = $.state('/');
	const inFlightPaths = new Set();
	const contentsCache = new Map();
	const iconCache = new Map();
	let hasChanges = $.derived(() => $.get(currentPath) !== $.get(initialPath));

	const iconAliases = new Map([
		['svelte-kit', 'svelte'],
		['sveltekit', 'svelte'],
		['svelte_kit', 'svelte'],
		['sveltejs', 'svelte'],
		['other', 'empty']
	]);

	function normalizePath(path) {
		if (!path || path === './' || path === '/') return '/';

		const trimmed = path.replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/$/, '');

		return `/${trimmed}`;
	}

	function toProviderPath(path) {
		const normalized = normalizePath(path);

		if (normalized === '/') return './';

		return `./${normalized.slice(1)}`;
	}

	function resolveIconUrl(rawIconName) {
		if (!rawIconName) return null;

		const normalized = rawIconName.toLowerCase();
		const iconName = iconAliases.get(normalized) ?? normalized;

		return $iconPath()(iconName, 'color');
	}

	async function detectRuntimeOrFramework(path) {
		try {
			if (iconCache.has(path)) {
				return iconCache.get(path) ?? null;
			}

			const detection = await sdk.forProject(page.params.region, page.params.project).vcs.createRepositoryDetection({
				installationId: $installation().$id,
				providerRepositoryId: $repository().id,
				type: product() === 'sites' ? VCSDetectionType.Framework : VCSDetectionType.Runtime,
				providerRootDirectory: toProviderPath(path)
			});

			const iconName = product() === 'sites' ? detection.framework : detection.runtime;
			const resolved = resolveIconUrl(iconName);

			iconCache.set(path, resolved);

			return resolved;
		} catch(err) {
			iconCache.set(path, null);

			return null;
		}
	}

	async function detectIconsForChildren(parentPath) {
		const targetDir = getDirByPath(parentPath);

		if (!targetDir?.children?.length) return;

		const children = targetDir.children;
		const concurrency = 3;
		let index = 0;

		async function worker() {
			while (index < children.length) {
				const current = index;

				index += 1;

				const child = children[current];
				const icon = await detectRuntimeOrFramework(child.fullPath);

				if (icon && icon !== child.thumbnailUrl) {
					child.thumbnailUrl = icon;
				}
			}
		}

		await Promise.all(Array.from({ length: Math.min(concurrency, children.length) }, worker));
	}

	async function fetchContents(path) {
		const cached = contentsCache.get(path);

		if (cached) return cached;

		const content = await sdk.forProject(page.params.region, page.params.project).vcs.getRepositoryContents({
			installationId: $installation().$id,
			providerRepositoryId: $repository().id,
			providerRootDirectory: toProviderPath(path),
			providerReference: $$props.branch
		});

		const contents = content.contents ?? [];
		const fileCount = contents.length;
		const directories = contents.filter((e) => e.isDirectory).map((dir) => ({ name: dir.name }));
		const result = { fileCount, directories };

		contentsCache.set(path, result);

		return result;
	}

	function ensureChildren(path, directories) {
		const targetDir = getDirByPath(path);

		if (!targetDir) return;

		if (directories.length === 0) {
			targetDir.hasChildren = false;
			targetDir.children = [];

			return;
		}

		const existingByTitle = new Map((targetDir.children ?? []).map((child) => [child.title, child]));

		targetDir.children = directories.map((dir) => {
			const fullPath = path === '/' ? `/${dir.name}` : `${path}/${dir.name}`;
			const existing = existingByTitle.get(dir.name);

			if (existing) {
				existing.fullPath = fullPath;
				existing.hasChildren = true;
				existing.loading = existing.loading ?? false;
				existing.thumbnailUrl = existing.thumbnailUrl ?? $iconPath()('empty', 'grayscale');
				existing.children = existing.children ?? [];

				return existing;
			}

			return {
				title: dir.name,
				fullPath,
				fileCount: undefined,
				thumbnailUrl: $iconPath()('empty', 'grayscale'),
				children: [],
				hasChildren: true,
				loading: false
			};
		});
	}

	async function prefetchPath(path) {
		const normalized = normalizePath(path);
		const segments = normalized.split('/').filter((s) => s !== '');
		const pathsToLoad = ['/'];
		let currentPath = '/';

		for (const segment of segments) {
			currentPath = currentPath === '/' ? `/${segment}` : `${currentPath}/${segment}`;
			pathsToLoad.push(currentPath);
		}

		for (const pathToLoad of pathsToLoad) {
			const { fileCount, directories } = await fetchContents(pathToLoad);
			const targetDir = getDirByPath(pathToLoad);

			if (targetDir) {
				targetDir.fileCount = fileCount;
			}

			ensureChildren(pathToLoad, directories);
		}
	}

	$.user_effect(() => {
		if (!$.get(isLoading)) return;

		(async () => {
			try {
				const content = await fetchContents('/');
				const repoTitle = $repository()?.name ? `${$repository().name} (root)` : 'Repository (root)';

				directories[0] = {
					...directories[0],
					title: repoTitle,
					fileCount: content.fileCount
				};

				ensureChildren('/', content.directories);

				const detectedIcon = await detectRuntimeOrFramework('/');

				if (detectedIcon) {
					directories[0].thumbnailUrl = detectedIcon;
				}

				$.set(isLoading, false);
				$.set(expandedPaths, [...new Set([...$.get(expandedPaths), '/'])], true);
				prefetchPath(rootDir() || '/');
				detectIconsForChildren('/');
			} catch(error) {
				console.error('Failed to load root directory:', error);
				$.set(isLoading, false);
			}
		})();
	});

	function getDirByPath(path) {
		const segments = path.split('/').filter((s) => s !== '');
		let node = directories[0] ?? null;

		for (const seg of segments) {
			const next = node?.children?.find((d) => d.title === seg) ?? null;

			if (!next) return null;

			node = next;
		}

		return node;
	}

	async function loadPath(path) {
		// skip loading if this directory was done
		const targetDir = getDirByPath(path);

		if (!targetDir || targetDir.fileCount !== undefined) return;

		if (!targetDir.children) {
			targetDir.children = [];
		}

		if (inFlightPaths.has(path)) return;

		inFlightPaths.add(path);
		targetDir.loading = true;

		try {
			const { fileCount, directories: contentDirectories } = await fetchContents(path);

			if (contentDirectories.length === 0) {
				targetDir.hasChildren = false;
				targetDir.children = [];
				$.set(expandedPaths, [...new Set([...$.get(expandedPaths), path])], true);

				return;
			}

			targetDir.fileCount = fileCount;

			// set logo only for the current folder, not for the children
			const detectedIcon = await detectRuntimeOrFramework(path);

			if (detectedIcon) {
				targetDir.thumbnailUrl = detectedIcon;
			}

			ensureChildren(path, contentDirectories);
			detectIconsForChildren(path);
			$.set(expandedPaths, [...new Set([...$.get(expandedPaths), path])], true);
		} catch(error) {
			console.error('Failed to load directory:', error);
		} finally {
			targetDir.loading = false;
			inFlightPaths.delete(path);
		}
	}

	async function expandToPath(path) {
		const normalized = normalizePath(path);
		const segments = normalized.split('/').filter((s) => s !== '');
		const pathsToExpand = ['/'];
		let currentDir = directories[0];
		let walkPath = '/';

		for (const segment of segments) {
			walkPath = walkPath === '/' ? `/${segment}` : `${walkPath}/${segment}`;
			pathsToExpand.push(walkPath);

			if (!currentDir.children) {
				currentDir.children = [];
			}

			let nextDir = currentDir.children.find((d) => d.title === segment);

			if (!nextDir) {
				nextDir = {
					title: segment,
					fullPath: walkPath,
					fileCount: undefined,
					thumbnailUrl: $iconPath()('empty', 'grayscale'),
					children: [],
					hasChildren: true
				};

				currentDir.children = [...currentDir.children, nextDir];
			}

			currentDir = nextDir;
		}

		$.set(expandedPaths, [...new Set([...$.get(expandedPaths), ...pathsToExpand])], true);

		// ensure each segment loads in order so deeper children appear
		for (const pathToLoad of pathsToExpand) {
			// eslint-disable-next-line no-await-in-loop
			await loadPath(pathToLoad);
		}

		$.set(currentPath, normalized, true);
	}

	$.user_effect(() => {
		if (show() && !$.get(initialized) && !$.get(isLoading)) {
			$.set(initialized, true);

			const normalized = normalizePath(rootDir() || '/');

			$.set(initialPath, normalized, true);
			$.set(currentPath, normalized, true);
			expandToPath(normalized);
		}
	});

	// reset state when modal closes
	$.user_effect(() => {
		if (!show() && $.get(initialized)) {
			$.set(initialized, false);
		}
	});

	function handleSelect(detail) {
		loadPath(detail.fullPath);
	}

	function handleSubmit() {
		rootDir($.get(currentPath));
		show(false);
	}

	Modal($$anchor, {
		title: 'Root directory',
		onSubmit: handleSubmit,
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			DirectoryPicker($$anchor, {
				get directories() {
					return directories;
				},

				get isLoading() {
					return $.get(isLoading);
				},

				get expanded() {
					return expandedStore;
				},

				get openTo() {
					return $.get(initialPath);
				},
				onSelect: handleSelect,
				get selected() {
					return $.get(currentPath);
				},

				set selected($$value) {
					$.set(currentPath, $$value, true);
				}
			});
		},

		$$slots: {
			default: true,
			description: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_1 = $.first_child(fragment_2);

				Button(node_1, {
					secondary: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => $.get(isLoading) || !$.get(hasChanges));

					Button(node_2, {
						submit: true,
						get disabled() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Save');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_2);
			}
		}
	});

	$.pop();
	$$cleanup();
}