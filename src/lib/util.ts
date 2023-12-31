import { UserRole, type TimerType } from './types';

export function formatDuration(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	seconds = seconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const timerTypeToName = (timerType: TimerType) =>
	timerType === 'main'
		? 'Speech Timer'
		: timerType === 'affPrep'
		? 'Aff Prep Time'
		: 'Neg Prep Time';

export const roles = [UserRole.Judge, UserRole.Competitor, UserRole.Spectator];

export function userRoleToName(role: UserRole | undefined) {
	switch (role) {
		case UserRole.Judge:
			return 'Judge';
		case UserRole.Competitor:
			return 'Competitor';
		case UserRole.Spectator:
			return 'Spectator';
		default:
			return 'Unknown';
	}
}
