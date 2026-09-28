<script context="module">
  export const meta = {
    title: 'Stories/Tabs',
    parameters: {},
    argTypes: {},
    args: {}
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Icon, TabContent, TabPane } from '@sveltestrap/sveltestrap';

  let status = 'alpha';
</script>

<Template let:args>
  <div class="tab-example">
    <TabContent>
      <TabPane class="pt-3" tabId="alpha" tab="Alpha" active>
        <h2 class="text-content">Alpha</h2>
        <img
          alt="Alpha Flight"
          src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"
        />
      </TabPane>
      <TabPane class="pt-3" tabId="bravo" tab="Bravo">
        <h2 class="text-content">Bravo</h2>
        <img
          alt="Johnny Bravo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"
        />
      </TabPane>
      <TabPane class="pt-3" tabId="charlie" tab="Charlie">
        <h2 class="text-content">Charlie</h2>
        <img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png" />
      </TabPane>
    </TabContent>
  </div>
</Template>

<Story name="Basic" />

<Story name="Pills">
  <TabContent pills>
    <TabPane class="pt-3" tabId="alpha" tab="Alpha" active>
      <img
        alt="Alpha Flight"
        src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"
      />
    </TabPane>
    <TabPane class="pt-3" tabId="bravo" tab="Bravo">
      <img
        alt="Johnny Bravo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"
      />
    </TabPane>
    <TabPane class="pt-3" tabId="charlie" tab="Charlie">
      <img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png" />
    </TabPane>
  </TabContent>
</Story>

<Story name="Disabled">
  <div class="tab-example">
    <TabContent class="disabled-tab" pills>
      <TabPane class="pt-3" tabId="alpha" tab="Alpha" active>
        <img
          alt="Alpha Flight"
          src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"
        />
      </TabPane>
      <TabPane class="pt-3" tabId="bravo" tab="Bravo">
        <img
          alt="Johnny Bravo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"
        />
      </TabPane>
      <TabPane class="pt-3" tabId="charlie" tab="Charlie" disabled>
        <img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png" />
      </TabPane>
    </TabContent>
  </div>
</Story>

<Story name="Slots">
  <TabContent>
    <TabPane class="pt-3" tabId="alpha" active>
      <span slot="tab">
        Alpha <Icon name="gear" />
      </span>
      <img
        alt="Alpha Flight"
        src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"
      />
    </TabPane>
    <TabPane class="pt-3" tabId="bravo">
      <span slot="tab">
        Bravo <Icon name="hand-thumbs-up" />
      </span>
      <img
        alt="Johnny Bravo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"
      />
    </TabPane>
    <TabPane class="pt-3" tabId="charlie">
      <span slot="tab">
        Charlie <Icon name="alarm" />
      </span>
      <img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png" />
    </TabPane>
  </TabContent>
</Story>

<Story name="Vertical">
  <div class="tab-example">
    <TabContent vertical pills>
      <TabPane tabId="alpha" tab="Alpha" active>
        <h2 class="text-content">Alpha</h2>
        <img
          alt="Alpha Flight"
          src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"
        />
      </TabPane>
      <TabPane tabId="bravo" tab="Bravo">
        <h2 class="text-content">Bravo</h2>
        <img
          alt="Johnny Bravo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"
        />
      </TabPane>
      <TabPane tabId="charlie" tab="Charlie">
        <h2 class="text-content">Charlie</h2>
        <img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png" />
      </TabPane>
    </TabContent>
  </div>
</Story>

<Story name="Events">
  <div class="tab-example">
    <h5 class="text-content">Current state: {status}</h5>
    <TabContent class="pt-3" on:tab={(e) => (status = e.detail)}>
      <TabPane class="pt-3" tabId="alpha" tab="Alpha" active>
        <h2 class="text-content">Alpha</h2>
      </TabPane>
      <TabPane class="pt-3" tabId="bravo" tab="Bravo">
        <h2 class="text-content">Bravo</h2>
      </TabPane>
      <TabPane class="pt-3" tabId="charlie" tab="Charlie">
        <h2 class="text-content">Charlie</h2>
      </TabPane>
    </TabContent>
  </div>
</Story>
