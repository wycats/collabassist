<script lang="ts">
	import type { ComponentType } from 'svelte';
	import type { Message, TextMessage, CardMessage, ArtifactLinkMessage } from '$lib/domain/message';
	import { cardRegistry } from '$lib/ui/card-registry';
	import type { AnyCard } from '$lib/cards/types';

	const props = $props<{
		message: Message;
		onCardSubmit?: (
			payload: { messageId: string; cardType: string } & Record<string, unknown>
		) => void;
		onAccept?: (card: AnyCard) => void;
		onRefine?: (card: AnyCard) => void;
		onFork?: (card: AnyCard) => void;
		isCardAccepted?: (card: AnyCard) => boolean;
	}>();

	let isUser = $derived(props.message.role === 'user');

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

<div class={`message-row ${isUser ? 'is-user' : 'is-assistant'}`}>
	<div
		class={props.message.kind === 'text' ? 'message-frame text-frame' : 'message-frame card-frame'}
	>
		<div
			class={`message-bubble ${
				props.message.kind === 'text' ? (isUser ? 'user-text' : 'assistant-text') : ''
			}`}
		>
			{#if props.message.kind === 'text'}
				<p>{(props.message as TextMessage).content}</p>
			{:else if props.message.kind === 'card'}
				{#key props.message.id}
					{@const cardMessage = props.message as CardMessage}
					{@const cardSpec = cardMessage.spec as AnyCard}
					{@const CardComponent = getCardComponent(cardMessage.cardType)}
					{#if CardComponent}
						<CardComponent
							message={cardMessage}
							onSubmit={(detail: Record<string, unknown>) =>
								handleCardSubmit(detail ?? {}, cardMessage)}
							onAccept={props.onAccept && !props.isCardAccepted?.(cardSpec)
								? () => props.onAccept?.(cardSpec)
								: undefined}
							onRefine={() => props.onRefine?.(cardSpec)}
							onFork={() => props.onFork?.(cardSpec)}
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

<style>
	.message-row {
		margin-bottom: 0.65rem;
		display: flex;
	}

	.message-row.is-user {
		justify-content: flex-end;
	}

	.message-row.is-assistant {
		justify-content: flex-start;
	}

	.message-frame {
		display: flex;
		align-items: end;
		gap: 0.5rem;
	}

	.text-frame {
		max-width: 82%;
	}

	.card-frame {
		width: 100%;
	}

	.message-bubble {
		border-radius: 0.82rem;
		font-size: 0.9rem;
		line-height: 1.45;
	}

	.message-bubble p {
		margin: 0;
	}

	.message-bubble.user-text,
	.message-bubble.assistant-text {
		padding: 0.58rem 0.72rem;
	}

	.user-text {
		background: var(--color-primary-500, #2563eb);
		color: var(--color-primary-50, white);
		box-shadow: 0 8px 18px hsl(220 28% 18% / 0.12);
	}

	.assistant-text {
		border: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 78%, transparent);
		background: color-mix(in srgb, var(--color-surface-50, white) 86%, transparent);
		color: var(--color-surface-900);
	}
</style>
