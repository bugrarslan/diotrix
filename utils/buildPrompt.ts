export interface PromptContext {
	base: string;
	styleName?: string;
	styleTagline?: string;
	extraNotes?: string;
}

export interface BuildPromptOptions {
	prompt: string;
	negativePrompt?: string;
	style?: { name: string; tagline?: string } | null;
	extras?: string[];
}

const cleanText = (value: string): string => value.trim().replace(/\s+/g, " ");

export const buildPrompt = (options: BuildPromptOptions): { positive: string; negative?: string } => {
	const positiveParts: string[] = [];

	const mainPrompt = cleanText(options.prompt);
	if (mainPrompt) {
		positiveParts.push(mainPrompt);
	}

	if (options.style?.name) {
		const styleSegment = `Style: ${cleanText(options.style.name)}`;
		positiveParts.push(styleSegment);
	}

	if (options.style?.tagline) {
		positiveParts.push(cleanText(options.style.tagline));
	}

	(options.extras ?? [])
		.map((extra) => cleanText(extra))
		.filter((extra) => extra.length > 0)
		.forEach((extra) => positiveParts.push(extra));

	const positivePrompt = positiveParts.join(" | ");

	const negativePrompt = options.negativePrompt ? cleanText(options.negativePrompt) : undefined;

	return { positive: positivePrompt, negative: negativePrompt };
};

export type BuildPromptResult = ReturnType<typeof buildPrompt>;
