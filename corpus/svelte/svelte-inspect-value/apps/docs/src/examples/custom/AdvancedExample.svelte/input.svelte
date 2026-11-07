<script lang="ts">
  import Inspect, { type CustomComponents, addComponent } from 'svelte-inspect-value'
  import HexString from './HexString.svelte'

  let showString = $state(false)
  let useDefault = $state(false)

  const components: CustomComponents = {
    // Using the exported helper function enables proper typing for props
    // NOTE: the returned props can be considered overrides for props passed by Inspect
    // and does not need to be complete
    string: addComponent(
      HexString,
      // Optional props transform.
      // The custom prop `showString` will be reactive as this used $derived
      (props) => ({ showString, value: props.value }),
      // Optional predicate determines if custom component should be used (if true)
      // Uses default component if false
      (props) => props.value.startsWith('#') && !useDefault
    ),
  }

  const value = {
    red: '#FF0000',
    pink: '#FF00FF',
    yella: '#FFFF00',
    notAColor: 'hello',
  }
</script>

<Inspect class="not-content mt" name="colors" {value} customComponents={components} />

<div class="input-row">
  <label>
    show string value
    <input type="checkbox" bind:checked={showString} />
  </label>
  <label>
    use default
    <input type="checkbox" bind:checked={useDefault} />
  </label>
</div>
