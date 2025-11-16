import type { ChoiceCardSpec } from './choice';

// src/lib/domain/message.ts
export type Role = 'user' | 'assistant' | 'system' | 'tool';

export type MessageKind = 'text' | 'card' | 'artifact-link';

export interface BaseMessage {
	id: string;
	role: Role;
	kind: MessageKind;
	createdAt: string; // ISO string
}

export interface TextMessage extends BaseMessage {
	kind: 'text';
	content: string; // markdown-ish
}

export interface CardMessage<TSpec = unknown> extends BaseMessage {
	kind: 'card';
	cardType: string; // e.g. "choice", "command", "mockup"
	spec: TSpec;
}

export interface ArtifactLinkMessage extends BaseMessage {
	kind: 'artifact-link';
	artifactId: string;
	label?: string;
}

export type Message = TextMessage | CardMessage | ArtifactLinkMessage;

// Helper factories for local use
export function createUserTextMessage(content: string): TextMessage {
	return {
		id: crypto.randomUUID(),
		role: 'user',
		kind: 'text',
		content,
		createdAt: new Date().toISOString()
	};
}

export function createAssistantTextMessage(content: string): TextMessage {
	return {
		id: crypto.randomUUID(),
		role: 'assistant',
		kind: 'text',
		content,
		createdAt: new Date().toISOString()
	};
}

export interface CardMessage<TSpec = unknown> extends BaseMessage {
	kind: 'card';
	cardType: string; // 'choice', 'command', etc.
	spec: TSpec;
}

// A helper for creating a Choice card from the assistant
export function createAssistantChoiceCard(spec: ChoiceCardSpec): CardMessage<ChoiceCardSpec> {
	return {
		id: crypto.randomUUID(),
		role: 'assistant',
		kind: 'card',
		cardType: 'choice',
		spec,
		createdAt: new Date().toISOString()
	};
}
