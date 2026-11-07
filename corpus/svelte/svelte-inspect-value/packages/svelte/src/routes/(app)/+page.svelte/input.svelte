<script lang="ts">
  import { createPageTitle } from '$doclib/util.js'
  import Inspect, { type InspectOptions, type InspectProps } from '$lib/index.js'
  import { untrack } from 'svelte'
  import { fly } from 'svelte/transition'

  let { data } = $props()

  const alwaysPresent: Partial<InspectProps> = {
    theme: 'inspect',
    borderless: false,
  }

  const configurations: Partial<InspectOptions>[] = [
    {
      theme: 'inspect',
    },
    {
      theme: 'drak',
    },
    {
      theme: 'stereo',
    },
    {
      theme: 'dark',
    },
    {
      theme: 'dark',
      borderless: true,
    },
    {
      theme: 'stereo',
      borderless: true,
    },
    {
      theme: 'drak',
      borderless: true,
    },
    {
      theme: 'inspect',
      borderless: true,
    },
  ]

  const MAX = configurations.length - 1

  let currentIndex = $state(0)
  let currentOpts = $derived({ ...alwaysPresent, ...configurations[currentIndex] })

  $effect(() => {
    let interval: number
    untrack(() => {
      interval = window.setInterval(() => {
        if (currentIndex === MAX) {
          currentIndex = 0
          alwaysPresent.search = true
        } else {
          currentIndex += 1
        }
      }, 5000)
    })

    return () => {
      window.clearInterval(interval)
    }
  })

  $effect(() => {
    let timeout: number
    untrack(() => {
      timeout = window.setTimeout(() => {
        alwaysPresent.style = 'rotate: 360deg; transition: rotate 5s linear'
      }, 600000)
    })
    return () => {
      window.clearTimeout(timeout)
    }
  })
</script>

<svelte:head>
  <title>{createPageTitle('Home')}</title>
</svelte:head>

<div class="center">
  <Inspect
    style="max-width: 640px"
    heading="packageInfo"
    values={{
      name: 'svelte-inspect-value',
      installCommands: [
        'copy to clipboard 👉',
        'npm install svelte-inspect-value',
        'pnpm add svelte-inspect-value',
        'bun add svelte-inspect-value',
        'yarn add svelte-inspect-value',
      ],
      npm: 'https://www.npmjs.com/package/svelte-inspect-value',
      github: 'https://github.com/ampled/svelte-inspect-value',
      docs: 'https://inspect.eirik.space/',
      playground: 'https://svelte.dev/playground/956365d6905c44298234ff4d9c60741e?version=5',
      stats: data.stats,
    }}
    {...currentOpts}
  />

  <div class="theme-display">
    theme:
    {#key currentOpts.theme}
      <div in:fly={{ y: -10, delay: 450 }} out:fly={{ y: 10 }}>
        {currentOpts.theme}
        {currentOpts.borderless ? '(borderless)' : ''}
      </div>
    {/key}
  </div>
</div>

<h2>What it is</h2>
<p>
  Svelte Inspect Value is a collection of "JSON tree"-like value inspector components.<br />

  The main purpose of the components is to be a developer utility. When developing apps it can be
  useful to have a "live" preview of state like API data, form values, the state of a promise and so
  on.
</p>

<h2>Features</h2>

<p>
  The <a href="/reference/examples">examples</a> page is the quickest way to get an overview of what
  this component can do, but here is a list of its key features:
</p>

<ul>
  <li>Display arrays & objects in a tree-like view</li>
  <li>
    Support for most JavaScript built-ins, including <code>Set</code>, <code>Map</code>,
    <code>Date</code>, <code>URL</code>, promises etc.
  </li>
  <li>Inspect current values of svelte stores or Observables</li>
  <li>
    Syntax highlighting for functions and html elements (outer selector) using <code>hljs</code>
  </li>
  <li>Embed media if string ends with image / audio extension (optional)</li>
  <li>Customizable colors</li>
  <li>Configurable with global options utility as alternative to passing props</li>
  <li><a href="/reference/panel">Fixed position</a> drawer / panel component</li>
</ul>

<style>
  .center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .theme-display {
    display: flex;
    gap: 1ch;
    padding: 2ch;
    width: 100%;
    max-width: 640px;
    font-size: 12px;
    font-family: monospace;
    text-align: left;
  }
</style>
