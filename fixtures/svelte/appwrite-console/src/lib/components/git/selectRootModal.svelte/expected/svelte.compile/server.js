import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { iconPath } from '$lib/stores/app';
import { sdk } from '$lib/stores/sdk';
import { installation, repository } from '$lib/stores/vcs';
import { VCSDetectionType } from '@appwrite.io/console';
import DirectoryPicker from '$lib/components/git/DirectoryPicker.svelte';
import { writable } from 'svelte/store';

export default function SelectRootModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = false, rootDir = '', product = 'functions', branch } = $$props;
		let isLoading = true;

		let directories = [
			{
				title: 'Repository (root)',
				fullPath: '/',
				fileCount: undefined,
				thumbnailUrl: $.store_get($$store_subs ??= {}, '$iconPath', iconPath)('empty', 'grayscale'),
				children: [],
				hasChildren: true,
				loading: false
			}
		];

		let currentPath = '/';
		let expandedPaths = [];
		const expandedStore = writable([]);
		let initialized = false;
		let initialPath = '/';
		const inFlightPaths = new Set();
		const contentsCache = new Map();
		const iconCache = new Map();
		let hasChanges = $.derived(() => currentPath !== initialPath);

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

			return $.store_get($$store_subs ??= {}, '$iconPath', iconPath)(iconName, 'color');
		}

		async function detectRuntimeOrFramework(path) {
			try {
				if (iconCache.has(path)) {
					return iconCache.get(path) ?? null;
				}

				const detection = await sdk.forProject(page.params.region, page.params.project).vcs.createRepositoryDetection({
					installationId: $.store_get($$store_subs ??= {}, '$installation', installation).$id,
					providerRepositoryId: $.store_get($$store_subs ??= {}, '$repository', repository).id,
					type: product === 'sites' ? VCSDetectionType.Framework : VCSDetectionType.Runtime,
					providerRootDirectory: toProviderPath(path)
				});

				const iconName = product === 'sites' ? detection.framework : detection.runtime;
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
				installationId: $.store_get($$store_subs ??= {}, '$installation', installation).$id,
				providerRepositoryId: $.store_get($$store_subs ??= {}, '$repository', repository).id,
				providerRootDirectory: toProviderPath(path),
				providerReference: branch
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
					existing.thumbnailUrl = existing.thumbnailUrl ?? $.store_get($$store_subs ??= {}, '$iconPath', iconPath)('empty', 'grayscale');
					existing.children = existing.children ?? [];

					return existing;
				}

				return {
					title: dir.name,
					fullPath,
					fileCount: undefined,
					thumbnailUrl: $.store_get($$store_subs ??= {}, '$iconPath', iconPath)('empty', 'grayscale'),
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
					expandedPaths = [...new Set([...expandedPaths, path])];

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
				expandedPaths = [...new Set([...expandedPaths, path])];
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
						thumbnailUrl: $.store_get($$store_subs ??= {}, '$iconPath', iconPath)('empty', 'grayscale'),
						children: [],
						hasChildren: true
					};

					currentDir.children = [...currentDir.children, nextDir];
				}

				currentDir = nextDir;
			}

			expandedPaths = [...new Set([...expandedPaths, ...pathsToExpand])];

			// ensure each segment loads in order so deeper children appear
			for (const pathToLoad of pathsToExpand) {
				// eslint-disable-next-line no-await-in-loop
				await loadPath(pathToLoad);
			}

			currentPath = normalized;
		}

		// reset state when modal closes
		function handleSelect(detail) {
			loadPath(detail.fullPath);
		}

		function handleSubmit() {
			rootDir = currentPath;
			show = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Root directory',
				onSubmit: handleSubmit,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					DirectoryPicker($$renderer, {
						directories,
						isLoading,
						expanded: expandedStore,
						openTo: initialPath,
						onSelect: handleSelect,
						get selected() {
							return currentPath;
						},

						set selected($$value) {
							currentPath = $$value;
							$$settled = false;
						}
					});
				},

				$$slots: {
					default: true,
					description: ($$renderer) => {
						$$renderer.push(`<span slot="description">Select the directory where your site code is located using the menu below.</span>`);
					},

					footer: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								disabled: isLoading || !hasChanges(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Save`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show, rootDir });
	});
}