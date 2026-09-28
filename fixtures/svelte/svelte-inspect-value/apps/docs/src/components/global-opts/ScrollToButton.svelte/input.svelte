<script lang="ts">
  import { scrollTo } from './GlobalOptionsList.svelte'

  let { id }: { id: string } = $props()
</script>

<sup>
  <button title="See how to set the {id} option" onclick={() => scrollTo(`#${id}`)}>?</button>
</sup>

<style>
  button {
    all: unset;
    display: inline;
    align-content: center; /* Simplest 2025 method */
    margin-bottom: 0.25em;
    border: 1px solid var(--sl-color-accent);
    border-radius: 9999px;
    width: 1em;
    height: 1em;
    color: var(--sl-color-accent);
    font-weight: bold;
    font-size: 12px;
    line-height: 1;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    text-align: center;

    &:hover {
      outline: 1px solid var(--sl-color-accent);
      outline-offset: 2px;
    }
  }

  @media screen and (width <= 360px) {
    button {
      font-size: 14px;
    }
  }
</style>
