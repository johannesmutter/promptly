<svelte:head>
	<title>One-click Login</title>
</svelte:head>

<main>
	<div>
		<h2>Sign Up</h2>
		<form action="?/register" method="POST" >
			<input type="text" name="email" />
			<button>Email Login Link</button>
		</form>  
	</div>
</main>


<style lang="postcss">
	main {
		padding: var(--size-4);
		& div {
			margin: 0 auto;
			max-width: 50ex;
		}
	}
</style>