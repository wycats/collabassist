<!-- src/lib/ui/Button.stories.svelte -->
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'radio' },
				options: ['primary', 'secondary', 'ghost']
			},
			disabled: { control: 'boolean' }
		},
		args: {
			variant: 'primary',
			disabled: false
		}
	});
</script>

<Story name="Primary" args={{ variant: 'primary' }}>Primary button</Story>

<Story name="Secondary" args={{ variant: 'secondary' }}>Secondary button</Story>

<Story name="Ghost" args={{ variant: 'ghost' }}>Ghost button</Story>

<Story name="Disabled" args={{ disabled: true }}>Disabled</Story>
