# `@rsvelte/eslint-plugin`

Turn off all rules already supported by [rsvelte](https://github.com/baseballyama/rsvelte). It
works like [`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint), with the
same configurations, exports and categories, so each finding appears once when you run rsvelte
and ESLint.

## Installation

```sh
npm install --save-dev @rsvelte/eslint-plugin
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
import rsvelte from '@rsvelte/eslint-plugin';

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
    'plugin:@rsvelte/recommended',
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

The categories are oxlint's, with oxlint's meanings:

- `correctness`: code that is wrong or useless.
- `suspicious`: code that is probably wrong or useless.
- `pedantic`: strict rules, or rules with occasional false positives.
- `perf`: code that can run faster.
- `style`: code that has a more idiomatic form.
- `restriction`: rules that forbid a language or library feature. Turn them on one by one.
- `nursery`: rules still under development.

A rule that oxlint also has takes oxlint's category, and so does a rule that checks what an oxlint
rule checks. For example, `svelte/no-at-html-tags` is `restriction` like `react/no-danger`, and
`svelte/button-has-type` is `restriction` like `react/button-has-type`. Each other rule takes the
category its effect calls for, not the upstream plugin's recommended set. Three rules differ from
their oxlint counterpart on purpose:

- `no-undef` is `correctness`: oxlint keeps its own port in `nursery` while it develops it.
- `svelte/require-each-key` is `pedantic`: React needs keys, but `{#each}` without a key is valid.
- `svelte/no-unknown-style-directive-property` is `correctness`: it finds a CSS property that
  does not exist, while `react/no-unknown-property` restricts how JSX spells attributes.

As in `eslint-plugin-oxlint`, `all` and `flat/all` leave out the rules of `nursery`.

## All configs

```js
configs: {
  // Only the `correctness` category.
  recommended: { plugins: ['@rsvelte'], overrides: [...] },
  'flat/recommended': [...],

  // Every rule but those of `nursery`.
  all: { plugins: ['@rsvelte'], overrides: [...] },
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

`@rsvelte/eslint-plugin/rules-by-scope` and `@rsvelte/eslint-plugin/rules-by-category` export the
rules of each plugin and of each category, as `eslintRules` or `correctnessRules`.
