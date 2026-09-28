<script lang="ts">
  import { onMount } from 'svelte'
  import { Inspect } from '@components'

  let data = $state<ReturnType<typeof getData>>()

  function getData() {
    const wait = new Promise((resolve) => {
      setTimeout(() => {
        resolve('')
      }, 3000)
    })

    const installCount = fetch(
      'https://api.npmjs.org/downloads/point/1970-01-01:2038-01-19/svelte-inspect-value'
    )
      .then((res) => res.json())
      .then((res) => res.downloads as number)

    const githubStars = fetch('https://api.github.com/repos/ampled/svelte-inspect-value')
      .then((res) => res.json())
      .then((data) => data.stargazers_count as number)

    return Promise.all([installCount, githubStars, wait]).then(([installCount, githubStars]) => ({
      installCount,
      githubStars,
    }))
  }

  onMount(() => {
    data = getData()
  })
</script>

<Inspect
  style="max-width: 640px; margin-left: auto; margin-right: auto"
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
    stats: getData(),
  }}
/>
