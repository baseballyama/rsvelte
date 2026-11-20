# `eslint-plugin-rsvelte`

Run [rsvelte](https://github.com/baseballyama/rsvelte) and ESLint side by side. This plugin
turns off each ESLint rule that `rsvelte lint` runs, so each finding appears once. ESLint keeps
the rules that rsvelte does not have.

## Install

```sh
npm install --save-dev eslint-plugin-rsvelte
```

## Use

Put `configs.all` last in `eslint.config.js`, after the configurations that turn rules on:

```js
import svelte from 'eslint-plugin-svelte';
import rsvelte from 'eslint-plugin-rsvelte';

export default [
  ...svelte.configs.recommended,
  // Other configurations.
  ...rsvelte.configs.all,
];
```

Run rsvelte first, then ESLint:

```json
{
  "scripts": {
    "lint": "rsvelte lint && eslint"
  }
}
```

`configs.all` turns a rule off only in the files where rsvelte runs it. For example, rsvelte
runs `no-undef` on `.svelte` files only, so ESLint still runs it on `.js` and `.ts` files.

`configs.all` turns off every rule that rsvelte has, including the ones that your rsvelte
configuration leaves off. Turn those rules on in rsvelte, or turn them back on in ESLint after
`configs.all`.

The plugin names rules of `eslint-plugin-svelte`, `eslint-plugin-vue` and `typescript-eslint`.
You do not need to install those plugins: ESLint accepts `"off"` for a rule of a plugin that is
not installed.

Use the version of this plugin that matches your version of `@rsvelte/cli`.
