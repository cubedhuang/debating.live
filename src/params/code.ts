import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = param => {
	return /^[A-Z]{4}$/.test(param);
};
