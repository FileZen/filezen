<script lang="ts">
	import FileUpload from '$lib/components/FileUpload.svelte';
</script>

<svelte:head>
	<title>FileZen SvelteKit Example</title>
	<meta name="description" content="Example of file uploads using SvelteKit" />
</svelte:head>

<main class="min-h-screen bg-gray-900 p-8">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-4 text-3xl font-bold text-white">
			FileZen Upload Example
		</h1>
		<p class="mb-8 text-lg text-gray-300">
			This example demonstrates how to use FileZen for file uploads with SvelteKit. 
			The upload is handled with API routes and server-side processing.
		</p>
		<FileUpload />
	</div>
</main>
