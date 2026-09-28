<script lang="ts">
  import AllTypes from '$doclib/examples/AllTypes.svelte'
  import { createPageTitle } from '$doclib/util.js'
  import { fade } from 'svelte/transition'

  const themes = {
    inspect: 'The default, original color scheme designed for this library',
    drak: 'Based on the famous dracula color scheme',
    stereo: 'Based on the great monokai color scheme',
    dark: `Because light hurts your eyes`,
    light: 'Is it bright in here?',
    plain: 'Uses the current font-color and color-mixing to create a dynamic color scheme',
  }
  const builtIns = Object.keys(themes) as (keyof typeof themes)[]
  let currentIndex = $state(0)
  let currentTheme = $derived(builtIns[currentIndex])

  function setCurrentIndex(dir: number) {
    currentIndex += dir
    if (currentIndex === -1) {
      currentIndex = builtIns.length - 1
    } else if (currentIndex === builtIns.length) {
      currentIndex = 0
    }
  }
</script>

<svelte:head>
  <title>{createPageTitle('Theming')}</title>
</svelte:head>

<h1>Themes</h1>

<div class="flex justify-center align-center">
  <button onclick={() => setCurrentIndex(-1)}> &LeftArrow; </button>

  <div class="flex col" style="max-width: 480px">
    <AllTypes
      seeFlashing
      style="max-width: 480px;"
      theme={currentTheme}
      heading={false}
      search={false}
    />
    {#key currentIndex}
      <div in:fade style="font-size: 0.8em">
        <b style="text-transform: capitalize;">{currentTheme}</b>
        <p>
          {themes[currentTheme]}
        </p>
      </div>
    {/key}
  </div>

  <button onclick={() => setCurrentIndex(1)}> &RightArrow; </button>
</div>

<h2>Base16</h2>

<p>
  Svelte Inspect Value utilizes the base16-framework for theming, meaning a theme can be defined
  with (less than) 16 colors.<br />
  If you have favorite <a target="_blank" href="https://github.com/chriskempson/base16">base16</a>
  color-scheme it will probably work well with <code>Inspect</code>.<br />
  The variables
  <code>--base04</code>
  and
  <code>--base0F</code>
  is currently not used by any default themes, but is still defined and can be used in
  <a href="/reference/custom">custom components.</a><br />
</p>

<h2>How To</h2>

<p>
  Visit the <a href="/theming/define">theme creator</a> for an overview of how the base16-variables are
  applied and examples on how to define and use a custom theme.
</p>
