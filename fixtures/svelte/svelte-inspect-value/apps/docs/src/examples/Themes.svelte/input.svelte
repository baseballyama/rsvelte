<script lang="ts">
  import { fade } from 'svelte/transition'
  import Generic from './Generic.svelte'

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

<div class="themes-container not-content">
  <button onclick={() => setCurrentIndex(-1)}> &LeftArrow; </button>

  <div class="flex col" style="flex-basis: 100%">
    <Generic seeFlashing style="width: 100%" theme={currentTheme} heading={false} search={false} />
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

<style>
  .themes-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    width: 100%;
  }
</style>
