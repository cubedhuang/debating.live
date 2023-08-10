export enum Stage {
	Setup,
	Debating,
	End
}

export type RoundState = {
	stage: Stage;
};
