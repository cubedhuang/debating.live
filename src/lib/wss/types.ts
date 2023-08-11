export enum Stage {
	Setup,
	Debating,
	End
}

export enum Speech {}

export type RoundState = {
	stage: Stage;
};
