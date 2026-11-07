<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';

	const programmingLanguages = [
		{
			developer: 'Brendan Eich',
			extension: '.js',
			id: '1',
			latestVersion: 'ES2021',
			name: 'JavaScript',
			paradigm: 'Multi-paradigm',
			popularity: 'High',
			releaseYear: '1995',
			typing: 'Dynamic'
		},
		{
			developer: 'Guido van Rossum',
			extension: '.py',
			id: '2',
			latestVersion: '3.10',
			name: 'Python',
			paradigm: 'Multi-paradigm',
			popularity: 'High',
			releaseYear: '1991',
			typing: 'Dynamic'
		},
		{
			developer: 'James Gosling',
			extension: '.java',
			id: '3',
			latestVersion: '17',
			name: 'Java',
			paradigm: 'Object-oriented',
			popularity: 'High',
			releaseYear: '1995',
			typing: 'Static'
		},
		{
			developer: 'Bjarne Stroustrup',
			extension: '.cpp',
			id: '4',
			latestVersion: 'C++20',
			name: 'C++',
			paradigm: 'Multi-paradigm',
			popularity: 'High',
			releaseYear: '1985',
			typing: 'Static'
		},
		{
			developer: 'Yukihiro Matsumoto',
			extension: '.rb',
			id: '5',
			latestVersion: '3.0',
			name: 'Ruby',
			paradigm: 'Multi-paradigm',
			popularity: 'Low',
			releaseYear: '1995',
			typing: 'Dynamic'
		}
	];
</script>

<div>
	<div class="bg-background overflow-hidden rounded-md border">
		<Table>
			<TableHeader>
				<TableRow class="bg-muted/50">
					<TableHead class="h-9 py-2">Name</TableHead>
					<TableHead class="h-9 py-2">Release Year</TableHead>
					<TableHead class="h-9 py-2">Developer</TableHead>
					<TableHead class="h-9 py-2">Typing</TableHead>
					<TableHead class="h-9 py-2">Paradigm</TableHead>
					<TableHead class="h-9 py-2">Extension</TableHead>
					<TableHead class="h-9 py-2">Latest Version</TableHead>
					<TableHead class="h-9 py-2">Popularity</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each programmingLanguages as language (language.id)}
					<TableRow>
						<TableCell class="py-2 font-medium">
							{language.name}
						</TableCell>
						<TableCell class="py-2">{language.releaseYear}</TableCell>
						<TableCell class="py-2">{language.developer}</TableCell>
						<TableCell class="py-2">{language.typing}</TableCell>
						<TableCell class="py-2">{language.paradigm}</TableCell>
						<TableCell class="py-2">{language.extension}</TableCell>
						<TableCell class="py-2">{language.latestVersion}</TableCell>
						<TableCell class="py-2">{language.popularity}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
	<p class="text-muted-foreground mt-4 text-center text-sm">Dense table</p>
</div>
