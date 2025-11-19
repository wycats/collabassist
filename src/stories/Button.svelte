<script lang="ts">
	interface Props {
		/** Is this the principal call to action on the page? */
		primary?: boolean;
		/** What background color to use */
		backgroundColor?: string;
		/** How large should the button be? */
		size?: 'small' | 'medium' | 'large';
		/** Button contents */
		label: string;
		/** The onclick event handler */
		onclick?: () => void;
	}

	const { primary = false, backgroundColor, size = 'medium', label, ...props }: Props = $props();

	let variant = $derived(primary ? 'primary' : 'secondary');
	let style = $derived(backgroundColor ? `background-color: ${backgroundColor}` : '');
</script>

<button type="button" data-size={size} data-variant={variant} {style} {...props}>
	{label}
</button>

<style>
	button {
		display: inline-block;
		cursor: pointer;
		border: 0;
		border-radius: 3em;
		font-weight: 700;
		line-height: 1;
		font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
		transition:
			background-color 120ms ease,
			color 120ms ease;
	}

	button[data-variant='primary'] {
		background-color: #555ab9;
		color: white;
	}

	button[data-variant='secondary'] {
		box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset;
		background-color: transparent;
		color: #333;
	}

	button[data-size='small'] {
		padding: 10px 16px;
		font-size: 12px;
	}

	button[data-size='medium'] {
		padding: 11px 20px;
		font-size: 14px;
	}

	button[data-size='large'] {
		padding: 12px 24px;
		font-size: 16px;
	}
</style>
