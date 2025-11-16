<script lang="ts">
	import type { Message, TextMessage, CardMessage, ArtifactLinkMessage } from '$lib/domain/message';
	import { cardRegistry } from '$lib/ui/card-registry';

	const props = $props<{
		message: Message;
		onCardSubmit?: (payload: { messageId: string; cardType: string; [key: string]: any }) => void;
	}>();

	const isUser = props.message.role === 'user';
	const isAssistant = props.message.role === 'assistant';
</script>

<div class={`mb-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
	<div class="flex max-w-[80%] items-end gap-2">
		<div
			class={`rounded-2xl px-3 py-2 text-sm leading-snug ${
				props.message.kind === 'text'
					? isUser
						? 'bg-primary-500 text-primary-50 shadow-sm'
						: 'text-surface-900-50 border border-surface-200-800/70 bg-surface-100-900'
					: ''
			}`}
		>
			{#if props.message.kind === 'text'}
				<p>{(props.message as TextMessage).content}</p>
			{:else if props.message.kind === 'card'}
				{#key props.message.id}
					{#if cardRegistry[(props.message as CardMessage).cardType]}
						{#await Promise.resolve(cardRegistry[(props.message as CardMessage).cardType]) then Card}
							<Card
								message={props.message as CardMessage}
								onSubmit={(detail) =>
									(props.onCardSubmit ?? (() => {}))({
										messageId: (props.message as CardMessage).id,
										cardType: (props.message as CardMessage).cardType,
										...detail
									})}
							/>
						{/await}
					{:else}
						<div class="text-surface-600-300 text-xs">
							Unknown card type: {(props.message as CardMessage).cardType}
						</div>
					{/if}
				{/key}
			{:else if props.message.kind === 'artifact-link'}
				<button
					class="text-surface-900-50 inline-flex items-center gap-2 rounded-full bg-surface-200-800 px-3
                       py-1 text-xs"
				>
					<span>🔗</span>
					<span>{(props.message as ArtifactLinkMessage).label ?? 'Artifact'}</span>
				</button>
			{/if}
		</div>
	</div>
</div>
