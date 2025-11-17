import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { InterpretCard, LensCard, MockupCard, ProposeCard } from '$lib/cards/types';

const INTERPRET_OPTIONS = [
	{
		id: 'data-model',
		label: 'Define the data model',
		summary: 'Entities, relationships, and permissions for the domain.'
	},
	{
		id: 'screens',
		label: 'Sketch main screens',
		summary: 'Layouts and navigation for the primary workflows.'
	},
	{
		id: 'flows',
		label: 'Shape the flows',
		summary: 'Key user journeys, error states, and confirmations.'
	}
] as const;

const PROPOSE_OPTIONS = [
	{
		id: 'minimal',
		label: 'Minimal: list + details overlay',
		summary: 'Keep it lean with a projects list and a focused task view overlay.'
	},
	{
		id: 'dashboard',
		label: 'Dashboard: overview + project pages',
		summary: 'Start from a dashboard with KPIs and jump into richer project pages.'
	},
	{
		id: 'workspace',
		label: 'Workspace: sidebar with sections',
		summary: 'Use a persistent sidebar to switch between projects and task-focused views.'
	}
] as const;

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => undefined)) as
		| {
				messages?: { role: string; content: string }[];
				phase?: string;
				interaction?: { type: string; optionId?: string };
		  }
		| undefined;

	const phase = body?.phase ?? 'discover';
	const selectedOption = body?.interaction?.optionId;

	if (phase === 'inspect') {
		if (selectedOption === 'minimal') {
			const mockupCard: MockupCard = {
				id: crypto.randomUUID(),
				kind: 'mockup',
				title: 'Minimal split layout sketch',
				description: 'Projects list with a lightweight task overlay for quick triage.',
				flowId: 'slice-1',
				stepIndex: 2,
				regions: [
					{
						id: 'toolbar',
						label: 'Top toolbar',
						layout: 'shelf',
						notes: 'Project switcher, new-task button, compact filters.'
					},
					{
						id: 'projects-list',
						label: 'Projects list',
						layout: 'bookcase',
						notes: 'Stacked rows with status, owner, and quick stats.'
					},
					{
						id: 'task-overlay',
						label: 'Task overlay',
						layout: 'library',
						notes: 'Slide-in panel showing task details + comments.'
					}
				]
			};

			return json(mockupCard);
		}

		if (selectedOption === 'workspace') {
			const mockupCard: MockupCard = {
				id: crypto.randomUUID(),
				kind: 'mockup',
				title: 'Workspace navigation sketch',
				description: 'Persistent sidebar anchors navigation while canvas shifts per project.',
				flowId: 'slice-1',
				stepIndex: 2,
				regions: [
					{
						id: 'sidebar',
						label: 'Workspace sidebar',
						layout: 'bookcase',
						notes: 'Workspace selector, pinned projects, quick actions.'
					},
					{
						id: 'overview-band',
						label: 'Overview band',
						layout: 'shelf',
						notes: 'Project health, notifications, upcoming work.'
					},
					{
						id: 'canvas-split',
						label: 'Canvas split',
						layout: 'library',
						notes: 'Primary task board with contextual drawer on the right.'
					}
				]
			};

			return json(mockupCard);
		}

		const lensCard: LensCard = {
			id: crypto.randomUUID(),
			kind: 'lens',
			title: 'Dashboard entity lens',
			description: 'Captures the dashboard sections implied by the architecture choice.',
			flowId: 'slice-1',
			stepIndex: 2,
			lensType: 'screens',
			payload: {
				sections: [
					{ id: 'hero', label: 'Header', contents: ['Nav', 'Profile', 'Global search'] },
					{ id: 'metrics', label: 'KPIs', contents: ['Velocity', 'At-risk projects', 'Team load'] },
					{
						id: 'projects',
						label: 'Projects grid',
						contents: ['Status', 'Owners', 'Quick actions', 'Alerts']
					}
				],
				callsToAction: ['Create project', 'Open triage queue', 'Share report']
			}
		};

		return json(lensCard);
	}

	if (phase === 'shape') {
		const card: ProposeCard = {
			id: crypto.randomUUID(),
			kind: 'propose',
			title: 'Here are a few ways we could shape this',
			description: 'Pick the architecture that feels closest to your app so we can refine it.',
			flowId: 'slice-1',
			stepIndex: 1,
			options: PROPOSE_OPTIONS.map((option) => ({ ...option }))
		};

		return json(card);
	}

	const card: InterpretCard = {
		id: crypto.randomUUID(),
		kind: 'interpret',
		title: 'What did you have in mind?',
		description: 'Pick the interpretation that best matches your goal so we can dive in.',
		flowId: 'slice-1',
		stepIndex: 0,
		options: INTERPRET_OPTIONS.map((option) => ({ ...option }))
	};

	return json(card);
};
