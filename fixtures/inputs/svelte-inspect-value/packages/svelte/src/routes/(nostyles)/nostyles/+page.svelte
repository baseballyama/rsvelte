<script lang="ts">
  // import AllTypes from '$doclib/examples/AllTypes.svelte'
  import Inspect from '$lib/index.js'

  const obj = {
    name: 'Squirtle',
    pokedex: {
      no: 7,
      description:
        'The shell is soft when it is born.\nIt soon becomes so resilient, prodding fingers will bounce off it.',
    },
    sprite: Promise.resolve(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png'
    ),
  }

  // const counter = new PersistedState('counter-asdfsg', 0, { syncTabs: false })
</script>

<Inspect style="margin: auto; width: 600px" search expandAll embedMedia values={obj} />
