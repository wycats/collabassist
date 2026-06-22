export type OptionToken = {
	code: string; // e.g. "A", "B", "C" or "1", "2", "3"
};

// Deterministic, readable token based on option id.
export function getOptionToken(id: string): OptionToken {
	// Try to keep demo options stable and meaningful.
	if (id === 'user-problem') return { code: 'A' };
	if (id === 'product-scope') return { code: 'B' };
	if (id === 'experience-shape') return { code: 'C' };
	if (id === 'brief-first') return { code: '1' };
	if (id === 'mockup-first') return { code: '2' };
	if (id === 'workflow-first') return { code: '3' };

	// Fallback: first letter uppercased.
	return { code: id.charAt(0).toUpperCase() };
}
