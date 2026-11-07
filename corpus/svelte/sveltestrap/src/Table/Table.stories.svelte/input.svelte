<script context="module">
  import Table from './Table.svelte';

  export const meta = {
    title: 'Stories/Table',
    component: Table,
    parameters: {
      controls: {
        exclude: /^(default)$/g
      }
    },
    argTypes: {
      class: {
        className: 'string',
        table: {
          disable: true
        }
      },
      size: {
        control: {
          type: 'select'
        },
        options: ['sm', 'lg']
      },
      bordered: {
        control: 'boolean'
      },
      borderless: {
        control: 'boolean'
      },
      striped: {
        control: 'boolean'
      },
      hover: {
        control: 'boolean'
      },
      responsive: {
        control: 'boolean'
      },
      rows: {
        control: 'object',
        table: {
          disable: true
        }
      },
      'default ': {
        description: 'This is the default content slot.',
        table: {
          category: 'slots',
          type: {
            summary: 'any'
          },
          defaultValue: {
            summary: 'empty'
          }
        }
      }
    },
    args: {
      size: 'lg',
      bordered: false,
      borderless: false,
      striped: false,
      hover: false,
      responsive: false
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Column } from '@sveltestrap/sveltestrap';

  const ROWS = [
    {
      first: 'Rufus',
      last: 'Sarsparilla',
      email: 'rufus.sarsparilla@example.com',
      dob: new Date(1968, 6, 15)
    },
    {
      first: 'Albert',
      last: 'Armadillo',
      email: 'albert.armadillo@example.com',
      dob: new Date(1972, 7, 17)
    },
    {
      first: 'Arron',
      last: 'Douglas',
      email: 'arron.douglas@example.com',
      dob: new Date(1982, 4, 1)
    },
    {
      first: 'Reginald',
      last: 'Rhodes',
      email: 'reginald.rhodes@example.com',
      dob: new Date(1968, 8, 14)
    },
    {
      first: 'Jimmy',
      last: 'Mendoza',
      email: 'jimmy.mendoza@example.com',
      dob: new Date(1964, 1, 1)
    },
    {
      first: 'Georgia',
      last: 'Montgomery',
      email: 'georgia.montgomery@example.com',
      dob: new Date(1960, 6, 4)
    },
    {
      first: 'Serenity',
      last: 'Thomas',
      email: 'serenity.thomas@example.com',
      dob: new Date(1973, 0, 11)
    },
    {
      first: 'Tonya',
      last: 'Elliott',
      email: 'tonya.elliott@example.com',
      dob: new Date(1954, 7, 17)
    },
    {
      first: 'Maxine',
      last: 'Turner',
      email: 'maxine.turner@example.com',
      dob: new Date(1961, 8, 19)
    },
    {
      first: 'Max',
      last: 'Headroom',
      email: 'max.headroom@example.com',
      dob: new Date(1984, 6, 1)
    }
  ];

  const basicSource = `<Table>
  <thead>
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Username</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Jacob</td>
      <td>Thornton</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>Larry</td>
      <td>the Bird</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</Table>`;
</script>

<Template let:args>
  <Table {...args}>
    <thead>
      <tr>
        <th>#</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Username</th>
        {#if args.responsive}
          {#each Array(10) as _, count}
            <th>Header {count + 4}</th>
          {/each}
        {/if}
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">1</th>
        <td>Mark</td>
        <td>Otto</td>
        <td>@mdo</td>
        {#if args.responsive}
          {#each Array(10) as _, count}
            <td>Cell {count + 4}</td>
          {/each}
        {/if}
      </tr>
      <tr>
        <th scope="row">2</th>
        <td>Jacob</td>
        <td>Thornton</td>
        <td>@fat</td>
        {#if args.responsive}
          {#each Array(10) as _, count}
            <td>Cell {count + 4}</td>
          {/each}
        {/if}
      </tr>
      <tr>
        <th scope="row">3</th>
        <td>Larry</td>
        <td>the Bird</td>
        <td>@twitter</td>
        {#if args.responsive}
          {#each Array(10) as _, count}
            <td>Cell {count + 4}</td>
          {/each}
        {/if}
      </tr>
    </tbody>
  </Table>
</Template>

<Story name="Basic" source={basicSource} />

<Story name="Bordered" args={{ bordered: true }} />

<Story name="Borderless" args={{ borderless: true }} />

<Story name="Hover" args={{ hover: true }} />

<Story name="Striped" args={{ striped: true }} />

<Story name="Sizes" args={{ size: 'sm' }} />

<Story name="Responsive">
  <Table responsive>
    <thead>
      <tr>
        <th>#</th>
        {#each Array(15) as _, count}
          <th>Header {count + 1}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">1</th>
        {#each Array(15) as _, count}
          <td>Cell {count + 1}</td>
        {/each}
      </tr>
      <tr>
        <th scope="row">2</th>
        {#each Array(15) as _, count}
          <td>Cell {count + 1}</td>
        {/each}
      </tr>
      <tr>
        <th scope="row">3</th>
        {#each Array(15) as _, count}
          <td>Cell {count + 1}</td>
        {/each}
      </tr>
    </tbody>
  </Table>
</Story>

<Story name="Columns">
  <Table rows={ROWS} let:row>
    <Column header="First Name" width="8rem">
      {row.first}
    </Column>
    <Column header="Last Name" width="8rem">
      {row.last}
    </Column>
    <Column header="Email">
      {row.email}
    </Column>
    <Column header="Birthdate" width="10rem" class="text-right">
      {row.dob.toDateString()}
    </Column>
  </Table>
</Story>
