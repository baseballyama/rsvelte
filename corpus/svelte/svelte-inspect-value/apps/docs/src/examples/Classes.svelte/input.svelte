<script lang="ts">
  import { Inspect } from '@components'

  const cls = eval(`(class Greeter {
    static staticProperty = 'Hello'

    constructor(name) {
      this.name = name;
    }

    greet() {
      return 'Hello' + ' ' + this.name
    }
  
  })`)
</script>

<Inspect values={{ class: cls, classInstance: new cls('name') }} />
