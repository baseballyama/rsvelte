// Environment preconditions every oracle entry point shares.
//
// eslint-plugin-svelte transpiles a `<style lang="scss">` block before deciding
// whether its selectors are used, and finds the preprocessor with `loadModule`,
// which resolves from `context.cwd` and then from the LINTED FILE's directory —
// both of which walk up to the repository root, never to this package. (Its
// third fallback, the plugin's own `__filename`, is dead under ESM.) So the
// answer depends on whether the repo root has `node_modules`, which a
// developer's checkout has and a CI job without `pnpm install` does not. That is
// a measurement of the tree rather than of either linter, and it silently moved
// a ratchet entry between CI and local runs until this check existed.

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ORACLE_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(ORACLE_DIR, '../../..');

/** Preprocessors whose presence changes what the oracle reports. */
const REQUIRED = ['sass'];

export function assertPreprocessorsAreResolvable() {
	const req = createRequire(path.join(REPO_ROOT, '__resolve__.js'));
	for (const name of REQUIRED) {
		try {
			req.resolve(name);
		} catch {
			console.error(
				`[lint-oracle] '${name}' does not resolve from ${REPO_ROOT}, so a ` +
					`<style lang="scss"> block would be blanked instead of transpiled and the ` +
					`oracle's answer would differ from the baselined one. Run:\n  pnpm install`
			);
			process.exit(1);
		}
	}
}
