<script lang="ts">
	import type { ComponentType } from 'svelte';
	import type { Message, TextMessage, CardMessage, ArtifactLinkMessage } from '$lib/domain/message';
	import { cardRegistry } from '$lib/ui/card-registry';

	const props = $props<{
		message: Message;
		onCardSubmit?: (
			payload: { messageId: string; cardType: string } & Record<string, unknown>
		) => void;
		onRefine?: (card: any) => void;
		onFork?: (card: any) => void;
	}>();

	const isUser = props.message.role === 'user';

	type RegisteredCardType = keyof typeof cardRegistry;

	function getCardComponent(cardType: string): ComponentType | undefined {
		return cardRegistry[cardType as RegisteredCardType] as unknown as ComponentType | undefined;
	}

	function handleCardSubmit(detail: Record<string, unknown>, card: CardMessage) {
		(props.onCardSubmit ?? (() => {}))({
			messageId: card.id,
			cardType: card.cardType,
			...detail
		});
	}
</script>

<div class={`mb-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
	<div class={`flex items-end gap-2 ${props.message.kind === 'text' ? 'max-w-[80%]' : 'w-full'}`}>
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
					{@const cardMessage = props.message as CardMessage}
					{@const CardComponent = getCardComponent(cardMessage.cardType)}
					{#if CardComponent}
						<CardComponent
							message={cardMessage}
							onSubmit={(detail: Record<string, unknown>) =>
								handleCardSubmit(detail ?? {}, cardMessage)}
							onRefine={() => props.onRefine?.(cardMessage.spec)}
							onFork={() => props.onFork?.(cardMessage.spec)}
						/>
					{:else}
						<div class="text-surface-600-300 text-xs">
							Unknown card type: {cardMessage.cardType}
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
