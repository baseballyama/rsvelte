<script lang="ts">
  import MultiCode from '$doclib/examples/MultiCode.svelte'
  import { createPageTitle } from '$doclib/util.js'
  import { type CustomComponents, Inspect, addComponent } from '$lib/index.js'
  import CustomNumber from './CustomNumber.svelte'
  import customNumberCode from './CustomNumber.txt?raw'
  import ErrorOnHover from './ErrorOnHover.svelte'
  import code from './example.txt?raw'
  import ExpandableNumber from './ExpandableNumber.svelte'
  import HexString from './HexString.svelte'
  import customStringCode from './HexString.txt?raw'

  const anObject = {
    oneBillion: 1000000000,
    oneTwoThreeFourEtc: 1234567890,
    maxSafe: Number.MAX_SAFE_INTEGER,
    red: '#FF0000',
    pink: '#FF00FF',
    yella: '#FFFF00',
    notAColor: 'hello',
  }

  let showString = $state(false)

  const customComponents: CustomComponents = $derived({
    number: [CustomNumber],
    string: addComponent(
      HexString,
      (props) => ({ showString, value: props.value }),
      (props) => props.value.startsWith('#')
    ),
  })
</script>

<svelte:head>
  <title>{createPageTitle('Custom Components')}</title>
</svelte:head>

<h2>Custom Components <sup>beta</sup></h2>

<p>
  <code>svelte-inspect-value</code> aims to (eventually) export all the building blocks to extend the
  component with custom components.
</p>

<p>Better documentation soon! Here's a minimal example:</p>

<h3>Custom line</h3>

<!-- <div class="center"> -->
<!-- <Code code={customNumberCode} label="GoofyNumber.svelte" />
  <Code {code} label="svelte" /> -->

<MultiCode
  examples={[
    { code, label: '+page.svelte', language: 'svelte' },
    { code: customNumberCode, label: 'GoofyNumber.svelte', language: 'svelte' },
    { code: customStringCode, label: 'HexString.svelte', language: 'svelte' },
  ]}
/>
<!-- </div> -->

Result
<Inspect value={anObject} {customComponents} name="numbersAndColors" />

<label class="flex row align-center">
  show string for custom string component
  <input type="checkbox" bind:checked={showString} />
</label>

<h3>Custom expandable</h3>

*Custom expandables API is still unfinished

<Inspect value={2} customComponents={{ number: [ExpandableNumber] }} />

<h2>Error handling</h2>

<p>
  If any component, built-in or custom, should throw an error it will be caught by a boundary on an
  entry-per-entry basis and render error details.<br />
  The error value display component reverts to using default components to avoid further issues.
</p>

<Inspect
  value={{
    'clickToError👉': 'click me',
    hey: 'dont click me i will error',
  }}
  name="customString"
  customComponents={{ string: [ErrorOnHover] }}
/>
