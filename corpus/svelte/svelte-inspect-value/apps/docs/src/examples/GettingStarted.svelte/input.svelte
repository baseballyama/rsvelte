<script lang="ts">
  import { Inspect, Panel } from '@components'
  import _Inspect from 'svelte-inspect-value'

  let value = $state({
    id: undefined,
    firstName: 'Bob',
    lastName: 'Alice',
    email: 'bob@alice.lol',
    introduction: `The name is Alice.

    Bob Alice.`,
    birthDate: new Date(),
    website: new URL('https://alicebob.website/?ref=abcdefg#about'),
    age: -42,
    emailVerified: true,
    interests: ['radio', 'tv', 'internet', 'kayaks'],
  })

  const InspectValues = _Inspect.Values.withOptions(() => ({
    elementAttributes: { style: 'width: 400px;', class: 'mt not-content' },
    expandLevel: 0,
  }))
</script>

<div id="getting-started" class="not-content">
  <code id="panel-hint">Inspect.Panel 👉</code>
  <code>Inspect</code>
  <Inspect {value} style="max-width: 400px" />
  <code>Inspect.Values</code>
  <InspectValues {...value} />
  <Panel expandLevel={0} values={value} style="position:absolute" />
</div>

<style>
  #getting-started {
    position: relative;
    border-radius: 8px;
    background-color: var(--sl-color-gray-4);
    padding: 0.5em;
    height: 800px;
    overflow: hidden;
  }

  #panel-hint {
    position: absolute;
    top: 0.5em;
    right: 2em;
    padding-inline: 0.25em;
    padding-block: 0.25em;
  }

  code {
    display: inline-block;

    margin-top: 1em !important;
    background-color: var(--sl-color-gray-5);
    padding: 0.25em;
    line-height: 1;
  }
</style>
