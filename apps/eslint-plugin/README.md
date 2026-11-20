# `eslint-plugin-rsvelte`

Turn off all rules already supported by [rsvelte](https://github.com/baseballyama/rsvelte). It
works like [`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint), with the
same configurations, exports and categories, so each finding appears once when you run rsvelte
and ESLint.

## Installation

```sh
npm install --save-dev eslint-plugin-rsvelte
```

Use the version that matches your version of `@rsvelte/cli`.

## Usage

### Run rsvelte before ESLint

Add this script to your `package.json`:

```json
{
  "scripts": {
    "lint": "rsvelte lint && eslint"
  }
}
```

### Flat config

```js
// eslint.config.js
import svelte from 'eslint-plugin-svelte';
import rsvelte from 'eslint-plugin-rsvelte';

export default [
  ...svelte.configs.recommended,
  // Other configurations.
  ...rsvelte.configs['flat/recommended'], // Put rsvelte last.
];
```

### Legacy config

For ESLint's legacy configuration (ESLint 8 and earlier):

```js
// .eslintrc.js
module.exports = {
  extends: [
    // Other presets.
    'plugin:rsvelte/recommended',
  ],
};
```

## How it differs from `eslint-plugin-oxlint`

Each configuration turns a rule off only in the files where rsvelte runs it. For example, rsvelte
runs `no-undef` on `.svelte` files only, so ESLint still runs it on `.js` and `.ts` files. So a
configuration is a list of flat configurations, one for each set of files.

The plugin names rules of `eslint-plugin-svelte`, `eslint-plugin-vue` and `typescript-eslint`.
You do not need to install those plugins: ESLint accepts `"off"` for a rule of a plugin that is
not installed.

`buildFromOxlintConfig` and `buildFromConfigFile` have no counterpart yet. The configurations turn
rules off even when your rsvelte configuration leaves them off.

## Categories

The categories are oxlint's. A rule that oxlint also has, such as `no-unused-vars`, keeps
oxlint's category. Each other rule takes its category from the plugin it comes from:

- The plugin's recommended rules (essential, for Vue) are `correctness`.
- Possible errors, security and SvelteKit rules are `suspicious`.
- Best practices are `pedantic`, and stylistic rules are `style`.
- Experimental rules are `nursery`.
- An extension rule takes the category of the core rule it extends, when oxlint has that rule.

As in `eslint-plugin-oxlint`, `all` and `flat/all` leave out the rules of `nursery`.

## All configs

```js
configs: {
  // Only the `correctness` category.
  recommended: { plugins: ['rsvelte'], overrides: [...] },
  'flat/recommended': [...],

  // Every rule but those of `nursery`.
  all: { plugins: ['rsvelte'], overrides: [...] },
  'flat/all': [...],

  // By plugin.
  'flat/eslint': [...],
  'flat/typescript': [...],
  'flat/svelte': [...],
  'flat/vue': [...],

  // By category.
  'flat/correctness': [...],
  'flat/suspicious': [...],
  'flat/pedantic': [...],
  'flat/perf': [...],
  'flat/style': [...],
  'flat/restriction': [...],
  'flat/nursery': [...],
}
```

`eslint-plugin-rsvelte/rules-by-scope` and `eslint-plugin-rsvelte/rules-by-category` export the
rules of each plugin and of each category, as `eslintRules` or `correctnessRules`.
