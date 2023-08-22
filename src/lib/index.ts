export function formatDuration(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	seconds = seconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
