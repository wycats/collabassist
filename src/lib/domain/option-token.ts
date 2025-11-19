export type OptionToken = {
	code: string; // e.g. "A", "B", "C" or "1", "2", "3"
};

// Deterministic, readable token based on option id.
export function getOptionToken(id: string): OptionToken {
	// Try to keep demo options stable and meaningful.
	if (id === 'data-model') return { code: 'A' };
	if (id === 'screens') return { code: 'B' };
	if (id === 'flows') return { code: 'C' };
	if (id === 'minimal') return { code: '1' };
	if (id === 'dashboard') return { code: '2' };
	if (id === 'workspace') return { code: '3' };

	// Fallback: first letter uppercased.
	return { code: id.charAt(0).toUpperCase() };
}
