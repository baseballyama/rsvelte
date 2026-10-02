<script lang="ts">
  import Inspect, { type InspectProps } from '$lib/index.js'

  let props: InspectProps = $props()

  let demoObject = $state({
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
</script>

<Inspect value={demoObject} name="demo" style="max-width: 500px;" {...props} />
